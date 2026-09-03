/**
 * Rapport de recette HTML — tous les scénarios, exécutés ou non.
 *
 * Lit docs/RECETTE-BDD-FRONT.md comme source des scénarios, y croise le
 * résultat de la dernière exécution (docs/probe/bdd-results.json) et produit
 * docs/rapport-bdd.html.
 *
 * Le document reste la source : un scénario y figure dès qu'il est spécifié,
 * même si aucun code ne l'exécute encore. C'est justement ce que le rapport
 * doit montrer — la couverture réelle, pas seulement ce qui est vert.
 *
 *   node scripts/bdd-report.mjs        # appelé aussi en fin de `npm run bdd`
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
// Analyseur partage avec le generateur de .feature : un seul document, une
// seule lecture. Deux analyseurs auraient fini par diverger.
import { parseRecipe, RECIPE_PATH, stripMd } from './bdd/recipe.mjs';

const RECIPE = RECIPE_PATH;
const RESULTS = 'docs/probe/bdd-results.json';
const OUT = 'docs/rapport-bdd.html';

const STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  PENDING: 'pending',
};


const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const md = readFileSync(RECIPE, 'utf8');
const sections = parseRecipe(md);

const executed = existsSync(RESULTS)
  ? JSON.parse(readFileSync(RESULTS, 'utf8'))
  : { runAt: null, results: [] };
/**
 * Rapprochement par **US + numero**.
 *
 * L'identifiant de recette vaut `us.slice(-2)` + numero : `US-00-01` et
 * `US-01-01` rendent tous deux `01.x`. Rapprocher par cet identifiant faisait
 * passer des scenarios du lot L1 pour des scenarios du L0, et gonflait le
 * compte des executes (39 annonces pour 36 reels).
 */
const keyOf = (us, id) => `${us}.${id.slice(id.lastIndexOf('.') + 1)}`;
const byId = new Map(
  executed.results.map((r) => [keyOf(r.us, r.id), r]),
);

let passed = 0;
let failed = 0;
let pending = 0;

for (const section of sections) {
  for (const s of section.scenarios) {
    const run = byId.get(`${s.us}.${s.num}`);
    s.run = run ?? null;
    s.status = !run ? STATUS.PENDING : run.ok ? STATUS.PASSED : STATUS.FAILED;
    if (s.status === STATUS.PASSED) passed += 1;
    else if (s.status === STATUS.FAILED) failed += 1;
    else pending += 1;
  }
}

const total = passed + failed + pending;
const covered = passed + failed;
const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

const LABEL = {
  [STATUS.PASSED]: 'OK',
  [STATUS.FAILED]: 'KO',
  [STATUS.PENDING]: 'Non exécuté',
};

const rows = (section) =>
  section.scenarios
    .map(
      (s) => `
        <tr data-status="${s.status}">
          <td class="num">${esc(s.id)}</td>
          <td>
            <div class="title">${esc(stripMd(s.title))}</div>
            <div class="expected">${esc(stripMd(s.expected))}</div>
            ${s.run && !s.run.ok ? `<div class="failure">${esc(s.run.failures.join(' · '))}</div>` : ''}
          </td>
          <td><span class="badge ${s.status}">${LABEL[s.status]}</span></td>
          <td class="shot">${s.run ? `<code>${esc(s.run.file.replace('docs/', ''))}</code>` : '—'}</td>
        </tr>`,
    )
    .join('');

const sectionsHtml = sections
  .map((section) => {
    const p = section.scenarios.filter((s) => s.status === STATUS.PASSED).length;
    const f = section.scenarios.filter((s) => s.status === STATUS.FAILED).length;
    const n = section.scenarios.length;
    return `
      <section>
        <h2>
          <!-- Le lot devant l US : les numeros se repetent d un lot a l autre. -->
          <span class="us">${esc(section.lot)} · ${esc(section.us)}</span>
          ${esc(section.title)}
          <span class="counts">${p}/${n} OK${f ? ` · ${f} KO` : ''}</span>
        </h2>
        <table>
          <thead><tr><th>#</th><th>Scénario</th><th>Résultat</th><th>Capture</th></tr></thead>
          <tbody>${rows(section)}</tbody>
        </table>
      </section>`;
  })
  .join('');

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Recette BDD front — OUI-CRM</title>
<style>
  :root {
    --ground:#f7f7f9; --panel:#fff; --ink:#14161b; --ink2:#4b515f;
    --muted:#868d9b; --line:#e3e5ec;
    --ok:#047857; --ok-bg:#d1fae5; --ko:#b91c1c; --ko-bg:#fee2e2;
    --wait:#4b515f; --wait-bg:#eceef3; --accent:#0369a1;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground:#101216; --panel:#191c22; --ink:#e9ebf0; --ink2:#a8aebc;
      --muted:#767d8c; --line:#272b33;
      --ok:#34d399; --ok-bg:#064e3b; --ko:#f87171; --ko-bg:#4c1d1d;
      --wait:#a8aebc; --wait-bg:#242830; --accent:#38bdf8;
    }
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font:14px/1.55 'Plus Jakarta Sans',-apple-system,'Segoe UI',Roboto,sans-serif}
  .wrap{max-width:70rem;margin:0 auto;padding:2.5rem 1.25rem 5rem}
  h1{font-size:1.75rem;margin:0;letter-spacing:-.02em}
  .sub{color:var(--ink2);margin:.4rem 0 0}
  .meta{color:var(--muted);font-size:.8125rem;margin:.25rem 0 0}
  .summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));
    gap:.75rem;margin:1.75rem 0}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:1rem}
  .card b{display:block;font-size:1.6rem;line-height:1.1;letter-spacing:-.02em}
  .card span{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em}
  .bar{display:flex;height:.5rem;border-radius:999px;overflow:hidden;margin:.25rem 0 1.75rem;
    background:var(--wait-bg)}
  .bar i{display:block}
  .bar .p{background:var(--ok)} .bar .f{background:var(--ko)}
  .filters{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem}
  .filters button{font:inherit;cursor:pointer;border:1px solid var(--line);
    background:var(--panel);color:var(--ink2);border-radius:999px;padding:.35rem .85rem}
  .filters button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
  section{background:var(--panel);border:1px solid var(--line);border-radius:14px;
    margin-bottom:1rem;overflow:hidden}
  h2{font-size:.9375rem;margin:0;padding:.9rem 1.1rem;border-bottom:1px solid var(--line);
    display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
  .us{font-family:ui-monospace,monospace;font-size:.75rem;color:var(--muted)}
  .counts{margin-left:auto;font-weight:400;color:var(--muted);font-size:.8125rem}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:.6875rem;text-transform:uppercase;letter-spacing:.08em;
    color:var(--muted);font-weight:400;padding:.6rem 1.1rem;border-bottom:1px solid var(--line)}
  td{padding:.7rem 1.1rem;border-bottom:1px solid var(--line);vertical-align:top}
  tbody tr:last-child td{border-bottom:none}
  tr[hidden]{display:none}
  .num{font-family:ui-monospace,monospace;color:var(--muted);white-space:nowrap}
  .title{font-weight:500}
  .expected{color:var(--ink2);font-size:.8125rem;margin-top:.15rem}
  .failure{margin-top:.4rem;color:var(--ko);font-size:.8125rem;font-family:ui-monospace,monospace}
  .shot code{font-size:.75rem;color:var(--muted)}
  .badge{display:inline-block;border-radius:999px;padding:.15rem .6rem;font-size:.75rem;
    font-weight:500;white-space:nowrap}
  .badge.passed{background:var(--ok-bg);color:var(--ok)}
  .badge.failed{background:var(--ko-bg);color:var(--ko)}
  .badge.pending{background:var(--wait-bg);color:var(--wait)}
  footer{color:var(--muted);font-size:.8125rem;margin-top:2rem;border-top:1px solid var(--line);
    padding-top:1.25rem}
</style>
</head>
<body>
<div class="wrap">
  <h1>Recette BDD front</h1>
  <p class="sub">Tous les scénarios spécifiés, exécutés ou non. La source reste
    <code>docs/RECETTE-BDD-FRONT.md</code>.</p>
  <p class="meta">${executed.runAt ? `Dernière exécution : ${esc(executed.runAt.slice(0, 16).replace('T', ' '))}` : 'Aucune exécution enregistrée'} · ${sections.length} US</p>

  <div class="summary">
    <div class="card"><span>Total</span><b>${total}</b></div>
    <div class="card"><span>OK</span><b style="color:var(--ok)">${passed}</b></div>
    <div class="card"><span>KO</span><b style="color:var(--ko)">${failed}</b></div>
    <div class="card"><span>Non exécutés</span><b>${pending}</b></div>
    <div class="card"><span>Couverture</span><b>${pct(covered)}%</b></div>
  </div>

  <div class="bar" role="img" aria-label="${passed} OK, ${failed} KO, ${pending} non exécutés">
    <i class="p" style="width:${pct(passed)}%"></i><i class="f" style="width:${pct(failed)}%"></i>
  </div>

  <div class="filters">
    <button data-filter="all" aria-pressed="true">Tout (${total})</button>
    <button data-filter="passed" aria-pressed="false">OK (${passed})</button>
    <button data-filter="failed" aria-pressed="false">KO (${failed})</button>
    <button data-filter="pending" aria-pressed="false">Non exécutés (${pending})</button>
  </div>

  ${sectionsHtml}

  <footer>
    Les captures sont locales, régénérées par <code>npm run bdd</code> ; elles ne
    sont pas versionnées. Un scénario « non exécuté » est spécifié dans la recette
    mais n'a pas encore de code dans <code>scripts/bdd/scenarios.mjs</code>.
  </footer>
</div>
<script>
  const buttons = [...document.querySelectorAll('.filters button')];
  buttons.forEach((b) => b.addEventListener('click', () => {
    buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    const want = b.dataset.filter;
    document.querySelectorAll('tbody tr').forEach((tr) => {
      tr.hidden = want !== 'all' && tr.dataset.status !== want;
    });
    // Une section vidée par le filtre n'a plus lieu d'être affichée.
    document.querySelectorAll('section').forEach((s) => {
      s.hidden = ![...s.querySelectorAll('tbody tr')].some((tr) => !tr.hidden);
    });
  }));
</script>
</body>
</html>`;

mkdirSync('docs', { recursive: true });
writeFileSync(OUT, html);
console.log(
  `Rapport : ${OUT} — ${passed} OK, ${failed} KO, ${pending} non exécutés (${total} scénarios).`,
);
