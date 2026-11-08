"""Cliente mínimo do Chrome DevTools Protocol via --remote-debugging-pipe (só stdlib)."""
import base64, itertools, json, os, subprocess, tempfile, threading, queue

CHROME = '/usr/bin/google-chrome'


class Chrome:
    def __init__(self, width, height, scale=1):
        r_in, w_in = os.pipe()    # nós escrevemos -> chrome lê no fd 3
        r_out, w_out = os.pipe()  # chrome escreve no fd 4 -> nós lemos
        # perfil temporário do Chrome fora do /tmp (que tem pouco espaço) e apagado ao fechar
        base = os.path.join(os.path.expanduser('~'), '.cache', 'partiu-chrome')
        os.makedirs(base, exist_ok=True)
        self.profile = tempfile.mkdtemp(prefix='cdp-', dir=base)
        import atexit, shutil
        atexit.register(lambda p=self.profile, pr=None: (self.proc.poll() is None and self.proc.kill(), shutil.rmtree(p, ignore_errors=True)))

        def child():
            import fcntl
            a = fcntl.fcntl(r_in, fcntl.F_DUPFD, 20)
            b = fcntl.fcntl(w_out, fcntl.F_DUPFD, 20)
            os.dup2(a, 3)
            os.dup2(b, 4)

        self.proc = subprocess.Popen([
            CHROME, '--headless=new', '--remote-debugging-pipe', '--no-first-run',
            '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
            '--font-render-hinting=none', '--force-color-profile=srgb',
            f'--user-data-dir={self.profile}', f'--window-size={width},{height}', 'about:blank',
        ], close_fds=False, pass_fds=(), preexec_fn=child, stdout=subprocess.DEVNULL, stderr=open(os.path.join(self.profile, 'chrome.log'), 'w'))
        os.close(r_in); os.close(w_out)
        self.w = os.fdopen(w_in, 'wb', buffering=0)
        self.r = os.fdopen(r_out, 'rb', buffering=0)
        self.ids = itertools.count(1)
        self.pending = {}
        self.events = queue.Queue()
        self.handlers = []
        threading.Thread(target=self._reader, daemon=True).start()

        tid = self.call('Target.createTarget', url='about:blank')['targetId']
        self.sid = self.call('Target.attachToTarget', targetId=tid, flatten=True)['sessionId']
        self.send('Page.enable'); self.send('Runtime.enable')
        self.send('Emulation.setDeviceMetricsOverride', width=width, height=height,
                  deviceScaleFactor=scale, mobile=False)

    def _reader(self):
        buf = b''
        while True:
            chunk = self.r.read(1 << 16)
            if not chunk:
                return
            buf += chunk
            while b'\0' in buf:
                raw, buf = buf.split(b'\0', 1)
                msg = json.loads(raw)
                if 'id' in msg and msg['id'] in self.pending:
                    self.pending.pop(msg['id']).put(msg)
                else:
                    for h in self.handlers:
                        h(msg)
                    self.events.put(msg)

    def call(self, method, session=None, **params):
        i = next(self.ids)
        q = queue.Queue()
        self.pending[i] = q
        msg = {'id': i, 'method': method, 'params': params}
        if session:
            msg['sessionId'] = session
        self.w.write(json.dumps(msg).encode() + b'\0')
        res = q.get(timeout=120)
        if 'error' in res:
            raise RuntimeError(f'{method}: {res["error"]}')
        return res.get('result', {})

    def send(self, method, **params):
        return self.call(method, session=self.sid, **params)

    def js(self, expr):
        r = self.send('Runtime.evaluate', expression=expr, awaitPromise=True, returnByValue=True)
        if 'exceptionDetails' in r:
            raise RuntimeError(r['exceptionDetails'])
        return r['result'].get('value')

    def goto(self, url):
        self.send('Page.navigate', url=url)
        self.js("new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', () => r()))")

    def shot(self, fmt='png', clip=None, quality=None):
        p = {'format': fmt, 'captureBeyondViewport': False}
        if clip:
            p['clip'] = {**clip, 'scale': 1}
        if quality:
            p['quality'] = quality
        return base64.b64decode(self.send('Page.captureScreenshot', **p)['data'])

    def close(self):
        try:
            self.call('Browser.close')
        except Exception:
            pass
        self.proc.wait(timeout=10)
