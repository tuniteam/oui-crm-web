/**
 * Sonde d'interface — vérifie un développement dans un vrai navigateur.
 *
 * Ouvre l'application avec Playwright, se connecte, parcourt une liste d'écrans
 * et produit pour chacun : une capture, les erreurs de console et les appels
 * d'API en échec. C'est ce qui permet de constater qu'un écran s'affiche
 * réellement, là où `npm run build` ne prouve que la compilation.
 *
 *   node scripts/ui-probe.mjs                    # parcours par défaut
 *   node scripts/ui-probe.mjs --routes=/projects,/backoffice-users
 *   node scripts/ui-probe.mjs --dark             # même parcours en thème sombre
 *
 * Prérequis : le front (5174) et l'API (3001) démarrés, et SEED_PASSWORD
 * lisible dans ../oui-crm-api/.env.
 *
 * Utilise le Chrome installé (`channel: 'chrome'`) : aucun navigateur n'est
 * téléchargé.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FRONT = process.env.PROBE_FRONT ?? 'http://localhost:5174';
const API_PATH = '/api/v1';
const OUT = process.env.PROBE_OUT ?? '.probe';
const EMAIL =
  process.env.PROBE_EMAIL ?? 'email.ouicrm+superadmin@gmail.com';

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const DEFAULT_ROUTES = ['/projects', '/backoffice-users', '/profile'];
/**
 * Normalise les routes : Git Bash convertit un argument commençant par `/` en
 * chemin Windows (`/projects` devient `C:/Program Files/Git/projects`). On
 * accepte donc les deux formes et on ne garde que le dernier segment utile.
 */
const normalizeRoute = (raw) => {
  const cleaned = raw.trim().replace(/^.*Git(?=\/)/, '');
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const routes = (value('routes') ?? DEFAULT_ROUTES.join(','))
  .split(',')
  .map(normalizeRoute);
const dark = flag('dark');

function seedPassword() {
  if (process.env.SEED_PASSWORD) return process.env.SEED_PASSWORD;
  // Les identifiants de démo vivent dans le .env de l'API, pas ici.
  const env = readFileSync(resolve('../oui-crm-api/.env'), 'utf8');
  const line = env.split('\n').find((l) => l.startsWith('SEED_PASSWORD='));
  if (!line) throw new Error('SEED_PASSWORD introuvable dans ../oui-crm-api/.env');
  return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const slug = (route) => route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'racine';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
});

/** Journal remis à zéro entre deux écrans, pour attribuer chaque anomalie. */
let consoleErrors = [];
let failedCalls = [];

page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 200)));
page.on('response', (r) => {
  const url = r.url();
  if (url.includes(API_PATH) && r.status() >= 400) {
    failedCalls.push(`${r.status()} ${r.request().method()} ${url.split(API_PATH)[1]}`);
  }
});

const report = [];

async function capture(name, route) {
  consoleErrors = [];
  failedCalls = [];
  await page.goto(`${FRONT}${route}`, { waitUntil: 'domcontentloaded' });
  // Laisse les requêtes de la page se résoudre avant de juger.
  await page.waitForTimeout(1800);

  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });

  // Une page qui ne rend presque rien est le symptôme le plus courant.
  const textLength = (await page.locator('body').innerText()).trim().length;

  report.push({
    route,
    url: page.url(),
    file,
    textLength,
    consoleErrors: [...consoleErrors],
    failedCalls: [...failedCalls],
  });
}

try {
  if (dark) await page.emulateMedia({ colorScheme: 'dark' });

  await page.goto(`${FRONT}/auth/login`, { waitUntil: 'domcontentloaded' });
  await capture('00-login', '/auth/login');

  await page.getByTestId('auth-login-email-input').fill(EMAIL);
  await page.getByTestId('auth-login-password-input').fill(seedPassword());
  await page.getByTestId('auth-login-submit-button').click();

  await page
    .waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 20000 })
    .catch(() => {
      throw new Error(
        "connexion impossible — l'API tourne-t-elle sur le port 3001 ?",
      );
    });

  let i = 1;
  for (const route of routes) {
    await capture(`${String(i).padStart(2, '0')}-${slug(route)}`, route);
    i += 1;
  }
} finally {
  await browser.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

let problems = 0;
for (const r of report) {
  const flags = [];
  if (r.textLength < 40) flags.push('PAGE QUASI VIDE');
  if (r.failedCalls.length) flags.push(`APPELS EN ECHEC: ${r.failedCalls.join(', ')}`);
  if (r.consoleErrors.length) flags.push(`CONSOLE: ${r.consoleErrors.join(' | ')}`);
  if (flags.length) problems += 1;
  console.log(
    `${flags.length ? 'KO' : 'ok'}  ${r.route.padEnd(24)} ${r.file}` +
      (flags.length ? `\n      ${flags.join('\n      ')}` : ''),
  );
}
console.log(`\n${report.length} écran(s), ${problems} avec anomalie.`);
