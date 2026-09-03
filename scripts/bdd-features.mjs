/**
 * Génère `docs/features/*.feature` — vue Gherkin de la recette front.
 *
 * Le Gherkin est **produit, jamais édité à la main** :
 * `docs/RECETTE-BDD-FRONT.md` reste le document de référence, et
 * `scripts/bdd/scenarios.mjs` ce qui s'exécute réellement.
 *
 * Deux principes.
 *
 * 1. **Tous les scénarios y figurent**, exécutés ou non. Un fichier qui ne
 *    montrerait que ce qui tourne cacherait précisément ce qu'il reste à
 *    couvrir. Les étiquettes le disent : `@ok`, `@ko`, `@a-couvrir`.
 *
 * 2. **Même découpage que la recette de l'API** (`oui-crm-api/docs/features/`) :
 *    un fichier par domaine et non par US, le même nom de fichier, et les US
 *    couvertes listées dans le titre. Les deux dépôts se lisent alors côte à
 *    côte — le contrat d'un côté, ce que voit l'utilisateur de l'autre. Le lot
 *    porteur est ajouté au titre, ce que l'API ne fait pas.
 *
 *   node scripts/bdd-features.mjs
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { parseExecuted, parseRecipe, RECIPE_PATH } from './bdd/recipe.mjs';
import { scenarios } from './bdd/scenarios.mjs';

const OUT_DIR = 'docs/features';

/**
 * US → domaine, releve sur les en-tetes de `oui-crm-api/docs/features/*.feature`
 * (chaque fichier y liste les US qu'il couvre).
 *
 * Recopie ici plutot que lu a chaud : le `docs/` de l'API est hors git, et
 * faire dependre une generation du front d'un depot voisin la casserait des
 * qu'il n'est pas la. A completer quand l'API ouvre un nouveau domaine.
 */
const DOMAINS = [
  { file: 'auth', title: 'Authentification, session et cycle de vie du compte', us: ['US-00-01', 'US-00-02'] },
  { file: 'profile', title: 'Profil, accès aux projets et acceptation légale', us: ['US-00-03'] },
  { file: 'projects', title: 'Administration des projets', us: ['US-00-04'] },
  { file: 'users', title: 'Administration des utilisateurs du projet', us: ['US-00-05'] },
  { file: 'roles', title: 'Matrice des rôles d’un projet', us: ['US-00-06'] },
  { file: 'scopes', title: 'Périmètres géographiques d’un projet', us: ['US-00-07'] },
  { file: 'settings', title: 'Réglages du projet, gabarits et cachet', us: ['US-00-08'] },
  { file: 'reference-items', title: 'Valeurs de référentiel d’un projet', us: ['US-00-09'] },
  { file: 'audit-log', title: 'Journal d’activité d’un projet', us: ['US-00-10'] },
  { file: 'users-backoffice', title: 'Comptes back-office (plateforme)', us: ['US-00-11'] },
  { file: 'organizations', title: 'Base des organismes', us: ['US-01-01', 'US-01-02', 'US-01-03', 'US-01-13'] },
  { file: 'contacts', title: 'Contacts d’un organisme', us: ['US-01-04'] },
  { file: 'activities', title: 'Actions et agenda', us: ['US-01-08', 'US-01-09'] },
  { file: 'kanban', title: 'Tableau de prospection', us: ['US-01-10'] },
  { file: 'campaigns', title: 'Campagnes', us: ['US-01-11'] },
];

const md = readFileSync(RECIPE_PATH, 'utf8');
const sections = parseRecipe(md);
const byUs = new Map(sections.map((s) => [s.us, s]));

const executed = parseExecuted(md);

const TAG = { OK: '@ok', KO: '@ko', PENDING: '@a-couvrir' };

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let files = 0;
let total = 0;
let covered = 0;

for (const domain of DOMAINS) {
  const present = domain.us.filter((u) => byUs.has(u));
  if (present.length === 0) continue;

  const lots = [...new Set(present.map((u) => byUs.get(u).lot))].join(', ');

  const lines = [
    '# Généré par `npm run bdd:features` — ne pas éditer à la main.',
    `# Source : ${RECIPE_PATH}. Découpage aligné sur oui-crm-api/docs/features/.`,
    '',
    `@${domain.file}`,
    `Feature: ${domain.title} (${lots} · ${present.join(', ')})`,
    '  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la',
    '  recette de l’API décrit le contrat HTTP.',
    '',
    '  # @ok / @ko  : scénario exécuté par `npm run bdd`',
    '  # @a-couvrir : décrit, pas encore automatisé',
    '',
  ];

  for (const us of present) {
    const section = byUs.get(us);
    // Le lot devant l US : les numeros se repetent d un lot a l autre.
    lines.push(`  # ── ${section.lot} · ${us} · ${section.title}`);
    lines.push('');

    for (const sc of section.scenarios) {
      total += 1;
      const verdict = executed.get(`${us}.${sc.num}`);
      if (verdict) covered += 1;

      const runnable = scenarios.find(
        (s) => s.us === us && s.id.endsWith(`.${sc.num}`),
      );

      lines.push(`  ${verdict ? TAG[verdict] : TAG.PENDING}`);
      lines.push(`  Scenario: ${sc.title}`);

      if (runnable?.gherkin?.length) {
        for (const step of runnable.gherkin) lines.push(`    ${step}`);
      } else {
        // Pas d'etapes ecrites : on rend l'attendu de la recette, seule chose
        // que quelqu'un ait reellement formulee. Inventer des Given/When
        // donnerait un fichier credible et faux.
        lines.push(`    Then ${sc.expected.replace(/\s+/g, ' ')}`);
      }
      lines.push('');
    }
  }

  writeFileSync(`${OUT_DIR}/${domain.file}.feature`, lines.join('\n'));
  files += 1;
}

const orphans = sections
  .filter((s) => !DOMAINS.some((d) => d.us.includes(s.us)))
  .map((s) => s.us);

console.log(
  `${files} fichier(s) dans ${OUT_DIR} — ${total} scénario(s), ${covered} exécuté(s), ${total - covered} à couvrir.`,
);
if (orphans.length) {
  console.log(
    `US sans domaine (à ajouter dans DOMAINS) : ${orphans.join(', ')}`,
  );
}
