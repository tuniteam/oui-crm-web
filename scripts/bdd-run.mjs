/**
 * Exécute les scénarios de docs/RECETTE-BDD-FRONT.md dans un vrai navigateur.
 *
 *   npm run bdd                 # tout
 *   npm run bdd -- --us=08      # une US
 *   npm run bdd -- --id=01.9    # un scénario
 *
 * Produit une capture par scénario dans docs/screenshots/ — non versionnées,
 * régénérées à chaque exécution — et réinjecte le résultat dans la recette.
 *
 * Les cas d'erreur (compte verrouillé, e-mail déjà pris, 404) sont simulés en
 * interceptant la réponse de l'API : ils seraient sinon impossibles à
 * provoquer sur des données réelles.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scenarios } from './bdd/scenarios.mjs';
import { AUTO_END, AUTO_START, RECIPE_PATH } from './bdd/recipe.mjs';

const FRONT = process.env.PROBE_FRONT ?? 'http://localhost:5174';
const API = process.env.PROBE_API ?? 'http://localhost:3001/api/v1';
const SHOTS = 'docs/screenshots';
const EMAIL = process.env.PROBE_EMAIL ?? 'email.ouicrm+superadmin@gmail.com';

const args = process.argv.slice(2);
const val = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];

function seedPassword() {
  if (process.env.SEED_PASSWORD) return process.env.SEED_PASSWORD;
  const env = readFileSync(resolve('../oui-crm-api/.env'), 'utf8');
  const line = env.split('\n').find((l) => l.startsWith('SEED_PASSWORD='));
  if (!line) throw new Error('SEED_PASSWORD introuvable dans ../oui-crm-api/.env');
  return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

/** Un identifiant de projet réel est nécessaire aux scénarios du mode projet. */
async function firstProjectId(password) {
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password }),
  }).then((r) => r.json());
  const list = await fetch(`${API}/projects?limit=1`, {
    headers: { Authorization: `Bearer ${login.accessToken}` },
  }).then((r) => r.json());
  return list.data?.[0]?.id ?? null;
}

const selected = scenarios.filter(
  (s) =>
    (!val('us') || s.us.endsWith(val('us'))) &&
    (!val('id') || s.id === val('id')),
);

mkdirSync(SHOTS, { recursive: true });

const password = seedPassword();
const projectId = await firstProjectId(password);

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];

for (const scenario of selected) {
  // Un contexte neuf par scénario : pas de session ni d'interception héritée,
  // sinon un scénario qui simule un 409 contaminerait le suivant.
  const context = await browser.newContext({
    baseURL: FRONT,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  /**
   * 30 s ne suffisent pas en fin de suite complete.
   *
   * Les echecs intermittents observes sur US-00-09 n'etaient pas des
   * assertions mais des `page.goto` expirees : le serveur de developpement
   * ralentit sous la charge d'une cinquantaine de scenarios, et les memes
   * scenarios passent isolement. Un rouge qui ne dit rien du produit fait
   * douter de toute la suite.
   */
  page.setDefaultNavigationTimeout(60000);

  let calls = [];
  let headers = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.includes('/api/v1')) return;
    calls.push(`${r.method()} ${u.split('/api/v1')[1]}`);
    const h = r.headers()['x-project-id'];
    if (h) headers.push(h);
  });

  const apiCalls = (reset) => (reset ? ((calls = []), calls) : calls);
  const scopedHeaders = (reset) =>
    reset ? ((headers = []), headers) : headers;

  const failures = [];
  const expect = (ok, message = 'assertion non vérifiée') => {
    if (!ok) failures.push(message);
  };

  try {
    if (!scenario.anonymous) {
      await page.goto('/auth/login');
      await page.getByTestId('auth-login-email-input').fill(EMAIL);
      await page.getByTestId('auth-login-password-input').fill(password);
      await page.getByTestId('auth-login-submit-button').click();
      // Meme raison que le delai de navigation ci-dessus : sous charge, ou
      // juste apres un redemarrage de l'API, la redirection post-connexion
      // depasse 20 s et le scenario echouait avant meme de commencer.
      await page.waitForURL((u) => !u.pathname.startsWith('/auth'), {
        timeout: 60000,
      });
    }
    if (scenario.needsProject && !projectId) {
      throw new Error('aucun projet disponible pour ce scénario');
    }

    await scenario.run({ page, expect, apiCalls, scopedHeaders, projectId });
  } catch (e) {
    failures.push(e.message.split('\n')[0].slice(0, 200));
  }

  const file = `${SHOTS}/${scenario.id.replace('.', '-')}.png`;
  await page.screenshot({ path: file }).catch(() => {});
  await context.close();

  const ok = failures.length === 0;
  results.push({ ...scenario, ok, failures, file });
  console.log(
    `${ok ? 'ok' : 'KO'}  ${scenario.us} ${scenario.id.padEnd(6)} ${scenario.title}` +
      (ok ? '' : `\n      ${failures.join('\n      ')}`),
  );
}

await browser.close();

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} scénario(s) OK.`);

// ── Réinjection dans la recette ────────────────────────────────────────────
const RECIPE = RECIPE_PATH;
let md = readFileSync(RECIPE, 'utf8');

const START = AUTO_START;
const END = AUTO_END;

const row = (r) =>
  `| ${r.us} | ${r.id} | ${r.title} | ${r.ok ? 'OK' : 'KO'} | \`${r.file.replace('docs/', '')}\` |`;

/**
 * Fusionne avec le tableau existant : une exécution filtrée (--us, --id) ne
 * doit pas effacer le résultat des scénarios qu'elle n'a pas joués.
 */
const previous = new Map();
if (md.includes(START) && md.includes(END)) {
  const existing = md.slice(md.indexOf(START), md.indexOf(END));
  for (const line of existing.split('\n')) {
    // `[\d.\-]+` et non `[\d.]+` : les identifiants du lot L1 portent un
    // tiret (`01-01.2`). Sans lui, une execution filtree effacait du tableau
    // les scenarios qu'elle n'avait pas rejoues, au lieu de les preserver.
    const m = line.match(/^\|\s*US-\d\d-\d\d\s*\|\s*([\d.\-]+)\s*\|/);
    if (m) previous.set(m[1], line);
  }
}
for (const r of results) previous.set(r.id, row(r));

/**
 * Elague les identifiants disparus.
 *
 * La fusion ne faisait qu'ajouter : un scenario renumerote ou supprime laissait
 * sa ligne verte dans la recette, indefiniment. Le tableau annoncait alors une
 * couverture que plus rien ne verifiait — exactement l'assurance trompeuse que
 * ce document doit eviter. On ne garde que les identifiants encore declares.
 */
const declared = new Set(scenarios.map((s) => s.id));
for (const id of [...previous.keys()])
  if (!declared.has(id)) {
    previous.delete(id);
    console.log(`  (retire de la recette : ${id}, scenario supprime)`);
  }

const rows = [...previous.entries()]
  .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
  .map(([, line]) => line)
  .join('\n');

const total = previous.size;
const green = [...previous.values()].filter((l) => / OK /.test(l)).length;

const block = `${START}
_Généré par \`npm run bdd\` — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}. ${green}/${total} OK._
_Les captures sont locales et non versionnées : relancer \`npm run bdd\` pour les produire._

| US | # | Scénario | Résultat | Capture |
|---|---|---|---|---|
${rows}
${END}`;

md =
  md.includes(START) && md.includes(END)
    ? md.slice(0, md.indexOf(START)) + block + md.slice(md.indexOf(END) + END.length)
    : `${md.trimEnd()}\n\n---\n\n## Scénarios exécutés\n\n${block}\n`;

writeFileSync(RECIPE, md);
console.log(`Recette mise à jour : ${RECIPE}`);

// Le Gherkin est une vue de la recette : il se regenere avec elle. Appele ici
// et non chaine en `&&` dans package.json — `npm run bdd -- --us=08` aurait
// passe le filtre au dernier maillon, et le runner aurait tout rejoue.
await import('./bdd-features.mjs');

// Persiste le résultat pour le rapport HTML, qui croise la recette entière
// avec ce qui a réellement été exécuté.
mkdirSync('docs/probe', { recursive: true });
const RESULTS = 'docs/probe/bdd-results.json';
const previousRun = existsSync(RESULTS)
  ? JSON.parse(readFileSync(RESULTS, 'utf8')).results ?? []
  : [];
const merged = new Map(previousRun.map((r) => [r.id, r]));
for (const r of results) {
  merged.set(r.id, { id: r.id, us: r.us, title: r.title, ok: r.ok, failures: r.failures, file: r.file });
}
// Meme elagage que pour la recette : sans lui, le rapport HTML comptait encore
// les scenarios disparus et annoncait plus de verts qu'il n'y a d'executions.
for (const id of [...merged.keys()]) if (!declared.has(id)) merged.delete(id);
writeFileSync(
  RESULTS,
  JSON.stringify({ runAt: new Date().toISOString(), results: [...merged.values()] }, null, 2),
);

await import('./bdd-report.mjs');
