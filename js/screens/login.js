// Login (MVP, sem autenticação de verdade): redes sociais ou e-mail.
// Com e-mail, verifica se a conta já existe: se existe, pede a senha e abre a viagem organizada;
// se não existe, abre o cadastro e depois a montagem da viagem.
const ACCOUNTS_KEY = 'partiu.contas';
// Conta de demonstração, já com uma viagem montada.
const DEMO = { 'demo@partiu.app': { name: 'Ana' } };
let loginStep = 'email', loginEmail = '';

function accounts() {
  try { return { ...DEMO, ...JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}') }; } catch (e) { return { ...DEMO }; }
}
function saveAccount(email, name) {
  try {
    const own = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    own[email] = { name };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(own));
  } catch (e) { /* sem armazenamento: segue sem lembrar a conta */ }
}
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const firstName = (n) => (n || '').trim().split(/\s+/)[0] || 'viajante';

const SOCIAL = [
  ['google', 'Google', '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'],
  ['apple', 'Apple', '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8a4.8 4.8 0 0 0-4 2.5c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-4zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>'],
  ['facebook', 'Facebook', '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>']
];

function renderLogin() {
  const body = $('loginBody'), acc = accounts()[loginEmail];
  $('loginBack').style.visibility = loginStep === 'email' ? 'hidden' : 'visible';
  replay(body, S.stepDir < 0 ? 'step-b' : 'step-f');
  if (loginStep === 'email') {
    body.innerHTML = `
      <div class="lg-title"><h1>Entre ou crie sua <em>conta</em></h1><p class="sub">Leva menos de um minuto.</p></div>
      <div class="lg-social">${SOCIAL.map(([k, n, ic]) => `<button class="lg-soc ${k}" data-social="${k}" aria-label="Continuar com ${n}">${ic}<span>Continuar com ${n}</span></button>`).join('')}</div>
      <div class="lg-or"><span>ou com e-mail</span></div>
      <form class="lg-form" id="loginForm" novalidate>
        <label class="search lg-field" for="loginEmail"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--sec)"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>
          <input id="loginEmail" type="email" inputmode="email" autocomplete="email" placeholder="seu@email.com" aria-label="E-mail" value="${esc(loginEmail)}"></label>
        <p class="lg-err" id="loginErr" role="alert" hidden>Confira o e-mail digitado.</p>
        <button class="btn-primary" type="submit" id="loginGo">Continuar</button>
      </form>
      <p class="lg-hint">Para ver uma viagem já organizada, use <button class="text-btn" data-demo>demo@partiu.app</button></p>`;
    setTimeout(() => { const i = $('loginEmail'); if (i && !loginEmail) i.focus({ preventScroll: true }); }, 380);
  } else if (loginStep === 'senha') {
    body.innerHTML = `
      <div class="lg-who"><span class="lg-av">${esc(firstName(acc.name)[0].toUpperCase())}</span><span><strong>${esc(loginEmail)}</strong><small>Conta encontrada</small></span></div>
      <div class="lg-title"><h1>Que bom te ver de novo, <em>${esc(firstName(acc.name))}</em></h1><p class="sub">Digite sua senha para abrir sua viagem.</p></div>
      <form class="lg-form" id="loginForm" novalidate>
        <label class="search lg-field" for="loginPass"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--sec)"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <input id="loginPass" type="password" autocomplete="current-password" placeholder="Sua senha" aria-label="Senha"></label>
        <p class="lg-err" id="loginErr" role="alert" hidden>Digite sua senha.</p>
        <button class="btn-primary" type="submit">Entrar e ver minha viagem</button>
      </form>
      <button class="link lg-forgot" data-forgot>Esqueci minha senha</button>`;
    setTimeout(() => $('loginPass') && $('loginPass').focus({ preventScroll: true }), 380);
  } else {
    body.innerHTML = `
      <div class="lg-who"><span class="lg-av new">${svg('plus', 18, 2.4)}</span><span><strong>${esc(loginEmail)}</strong><small>Ainda não tem conta</small></span></div>
      <div class="lg-title"><h1>Vamos criar sua <em>conta</em></h1><p class="sub">Depois a gente monta sua viagem em poucos passos.</p></div>
      <form class="lg-form" id="loginForm" novalidate>
        <label class="search lg-field" for="signName"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--sec)"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.5-3.8 4.2-5.5 7.5-5.5s6 1.7 7.5 5.5"/></svg>
          <input id="signName" type="text" autocomplete="name" placeholder="Seu nome" aria-label="Nome"></label>
        <label class="search lg-field" for="signPass"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--sec)"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <input id="signPass" type="password" autocomplete="new-password" placeholder="Crie uma senha" aria-label="Senha"></label>
        <p class="lg-err" id="loginErr" role="alert" hidden>Preencha seu nome e uma senha.</p>
        <button class="btn-primary" type="submit">Criar conta e montar viagem</button>
      </form>
      <p class="lg-hint">Ao continuar, você aceita os termos de uso do Partiu.</p>`;
    setTimeout(() => $('signName') && $('signName').focus({ preventScroll: true }), 380);
  }
}
function loginNav(step, dir = 1) { S.stepDir = dir; loginStep = step; renderLogin(); }
function enterApp(name, isNew) {
  S.user = { name: firstName(name), email: loginEmail };
  if (isNew) { S.slide = 0; go('intro'); } else go('main');
}
function loginError(show) { const e = $('loginErr'); if (e) e.hidden = !show; }

$('loginBody').addEventListener('submit', (e) => {
  e.preventDefault();
  if (loginStep === 'email') {
    const v = $('loginEmail').value.trim().toLowerCase();
    if (!validEmail(v)) return loginError(true);
    loginEmail = v;
    const btn = $('loginGo');
    btn.disabled = true; btn.textContent = 'Verificando…';
    // Simula a consulta ao servidor
    setTimeout(() => loginNav(accounts()[v] ? 'senha' : 'cadastro'), 650);
  } else if (loginStep === 'senha') {
    if (!$('loginPass').value) return loginError(true);
    enterApp(accounts()[loginEmail].name, false);
  } else {
    const name = $('signName').value.trim(), pass = $('signPass').value;
    if (!name || !pass) return loginError(true);
    saveAccount(loginEmail, name);
    enterApp(name, true);
  }
});
$('loginBody').addEventListener('input', () => loginError(false));
$('loginBody').addEventListener('click', (e) => {
  const soc = e.target.closest('[data-social]');
  if (soc) {
    soc.classList.add('busy');
    soc.querySelector('span').textContent = 'Entrando…';
    loginEmail = 'demo@partiu.app';
    return setTimeout(() => enterApp('Ana', false), 700);
  }
  if (e.target.closest('[data-demo]')) { $('loginEmail').value = 'demo@partiu.app'; $('loginEmail').focus(); return; }
  if (e.target.closest('[data-forgot]')) { const f = e.target.closest('[data-forgot]'); f.textContent = 'Enviamos um link para o seu e-mail'; f.disabled = true; }
});
$('loginBack').onclick = () => loginNav('email', -1);
