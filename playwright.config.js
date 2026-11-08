// Testes de ponta a ponta (Playwright). Rodam no Google Chrome instalado na máquina,
// num celular (390 × 844, toque) e num desktop (1440 × 900), contra um servidor local do projeto.
//   npm test                 todos
//   npm test -- login        só os testes com "login" no nome
//   npm run test:ui          modo visual do Playwright
//   BASE_URL=https://swpartiu.vercel.app npm test   contra o site publicado
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const chrome = { executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' };

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/relatorio' }]],
  outputDir: 'tests/resultados',
  use: {
    baseURL: BASE,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off', // o ffmpeg do Playwright não existe para este Ubuntu; ficam o print e o trace
    launchOptions: chrome,
  },
  projects: [
    { name: 'celular', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', viewport: { width: 390, height: 844 }, launchOptions: chrome } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, launchOptions: chrome } },
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: `${BASE}/index.html`,
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
