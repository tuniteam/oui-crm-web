/**
 * Lecture de `docs/RECETTE-BDD-FRONT.md`.
 *
 * La recette est la source unique : elle porte **tous** les scénarios, ceux
 * qui sont exécutés comme ceux qui restent à écrire. Extrait ici pour que le
 * rapport HTML et le générateur de `.feature` lisent le même document de la
 * même façon, plutôt que d'entretenir deux analyseurs qui divergeraient.
 */

/** Le document de recette, et les marqueurs du tableau que le runner y
 *  réinjecte. Déclarés ici seuls : trois scripts les connaissaient chacun de
 *  son côté, une renommée les aurait désynchronisés en silence. */
export const RECIPE_PATH = 'docs/RECETTE-BDD-FRONT.md';
export const AUTO_START = '<!-- bdd:auto:start -->';
export const AUTO_END = '<!-- bdd:auto:end -->';

/**
 * Verdicts de la dernière exécution, relus dans le tableau généré.
 *
 * Rapprochés par **US + numéro** : l'identifiant de recette vaut
 * `us.slice(-2)` + numéro, donc `US-00-01` et `US-01-01` rendent tous deux
 * `01.x` — deux lots s'y confondraient.
 */
export function parseExecuted(md) {
  const verdicts = new Map();
  if (!md.includes(AUTO_START) || !md.includes(AUTO_END)) return verdicts;

  const block = md.slice(md.indexOf(AUTO_START), md.indexOf(AUTO_END));
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(
      /^\|\s*(US-\d\d-\d\d)\s*\|\s*([\d.\-]+)\s*\|\s*(.+?)\s*\|\s*(OK|KO)\s*\|/,
    );
    if (!m) continue;
    const [, us, id, , verdict] = m;
    verdicts.set(`${us}.${id.slice(id.lastIndexOf('.') + 1)}`, verdict);
  }
  return verdicts;
}

/** Une ligne `| 15-18 | … |` couvre plusieurs scénarios d'un coup. */
export function expandRange(cell) {
  const range = cell.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (!range) return [cell];
  const [, from, to] = range.map(Number);
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

export const stripMd = (s) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');

/**
 * Extrait les scénarios, section d'US par section d'US.
 *
 * Chaque scénario porte `us` et `num` : c'est le couple qui l'identifie de
 * façon sûre. Le champ `id` reste rendu pour compatibilité, mais il est
 * ambigu — `us.slice(-2)` donne `01` aussi bien pour `US-00-01` que pour
 * `US-01-01`. Ne pas s'en servir pour rapprocher un résultat d'exécution.
 */
export function parseRecipe(md) {
  const sections = [];
  let current = null;
  let inGenerated = false;

  // Le fichier est en CRLF : un retour chariot residuel empeche la fin du
  // motif de titre de mordre, et le statut de l'US restait colle au titre
  // de la Feature.
  for (const line of md.split(/\r?\n/)) {
    if (line.includes('bdd:auto:start')) inGenerated = true;
    if (line.includes('bdd:auto:end')) {
      inGenerated = false;
      continue;
    }
    if (inGenerated) continue;

    const heading = line.match(/^##\s+(US-(\d\d)-\d\d)\s*·\s*(.+?)\s*(?:—.*)?$/);
    if (heading) {
      current = {
        us: heading[1],
        /** Lot porteur : `US-01-04` appartient au lot L1. */
        lot: `L${Number(heading[2])}`,
        title: heading[3].trim(),
        scenarios: [],
      };
      sections.push(current);
      continue;
    }
    if (!current) continue;

    // `| 4 | Titre | Attendu |` ou `| 15-18 | … |`. La première cellule doit
    // commencer par un chiffre : sans cela les lignes de séparation Markdown
    // (`|---|---|`) seraient prises pour des scénarios.
    const row = line.match(
      /^\|\s*(\d+(?:\s*[-–]\s*\d+)?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/,
    );
    if (!row) continue;

    for (const num of expandRange(row[1].trim())) {
      current.scenarios.push({
        us: current.us,
        lot: current.lot,
        num,
        id: `${current.us.slice(-2)}.${num}`,
        title: stripMd(row[2].trim()),
        expected: stripMd(row[3].trim()),
      });
    }
  }
  return sections;
}
