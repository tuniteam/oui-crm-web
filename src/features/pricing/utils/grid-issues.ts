import type { PricingGridContent } from '../types/pricingGrid';

/**
 * Traduire `messages.details[]` — L2 · US-02-01, SPEC-19.
 *
 * **Ces chaînes sont des clés de correspondance, pas des phrases.** L'anglais
 * et les chemins techniques sont délibérés côté API : `subscription.ESSENTIEL:
 * 1 prices for 2 brackets` existe pour être mappé sur un champ, pas pour être
 * lu. Les concaténer dans un message d'erreur, ce que faisait cet écran, les
 * met sous les yeux d'un commercial.
 *
 * La règle n'est pas « elles ne remontent jamais » — elles remonteront :
 *
 * - à **l'activation** d'une version préparée il y a des semaines, que le
 *   serveur revalide avec des règles qui ont pu se durcir. L'écran qui reçoit
 *   ce `400` n'a jamais vu ce formulaire ;
 * - sur un contenu produit **autrement que par cet éditeur** — import, autre
 *   client, script.
 *
 * La règle est donc « elles ne s'affichent jamais brutes » : chaque chemin
 * connu se traduit devant son champ, et **tout le reste tombe dans un repli
 * générique**. Sans ce repli, une règle ajoutée côté serveur produirait un
 * écran muet — pire qu'un message technique.
 *
 * **Cet utilitaire rend une cause et des paramètres, jamais une phrase.**
 * C'est le patron du projet — `opening-hours.ts` rend `'BACKWARDS'` — et c'est
 * ce qui le rend éprouvable sans rien afficher : le français vit dans
 * `constants/`, avec le reste de l'interface.
 */

/** La cause, telle que l'écran la traduira. */
export type IssueCode =
  | 'BRACKETS_REQUIRED'
  | 'BRACKET_FIRST_AT_ZERO'
  | 'BRACKET_LAST_OPEN'
  | 'BRACKET_OVERLAP'
  | 'BRACKET_GAP'
  | 'BRACKET_MAX_BELOW_MIN'
  | 'BRACKET_LABEL_REQUIRED'
  | 'BRACKETS_AT_MOST'
  | 'PLAN_RESERVED'
  | 'PLAN_DUPLICATE'
  | 'PLAN_NAME_REQUIRED'
  | 'PLANS_AT_MOST'
  | 'SUBSCRIPTION_MISSING_PRICE'
  | 'SUBSCRIPTION_EXTRA_PRICE'
  | 'SUBSCRIPTION_NO_SUCH_PLAN'
  | 'OPTION_MISSING_PRICE'
  | 'OPTION_NAME_REQUIRED'
  | 'OPTION_INCLUDED_INVALID'
  | 'OPTION_DUPLICATE_ID'
  | 'OPTIONS_AT_MOST'
  | 'SETUP_LABEL_REQUIRED'
  | 'SETUP_NATURE_REQUIRED'
  | 'SETUP_NO_SUCH_PLAN'
  | 'SETUP_MISSING_TABLE'
  | 'SETUP_MISSING_PRICE'
  | 'SETUP_DUPLICATE_LABEL'
  | 'SETUP_AT_MOST'
  | 'EXTRA_PRICE_INVALID'
  | 'EXTRA_NAME_REQUIRED'
  | 'EXTRAS_AT_MOST'
  | 'UNKNOWN';

/** Où poser le message : de quoi viser un champ, ou une section entière. */
export type IssueAnchor =
  | { family: 'brackets'; index?: number }
  | { family: 'plans'; plan?: string }
  | { family: 'subscription'; plan: string; bracket?: number }
  | { family: 'options'; index?: number }
  | { family: 'setupFees'; key?: string; plan?: string }
  | { family: 'extras'; index?: number }
  | { family: 'unknown' };

export type GridIssue = {
  anchor: IssueAnchor;
  code: IssueCode;
  /** De quoi composer la phrase : noms d'éléments, bornes, décomptes. */
  params: Record<string, string | number>;
  /** La chaîne d'origine, gardée pour le détail dépliable et le support. */
  raw: string;
};

const bracketName = (c: PricingGridContent | null, i: number) =>
  c?.brackets?.[i]?.label ?? `n° ${i + 1}`;

const optionName = (c: PricingGridContent | null, i: number) =>
  c?.options?.[i]?.name ?? `n° ${i + 1}`;

const postName = (c: PricingGridContent | null, key: string) =>
  c?.setupFees?.[key]?.label ?? key;

const extraName = (c: PricingGridContent | null, i: number) =>
  c?.extras?.[i]?.name ?? `n° ${i + 1}`;

/**
 * La table de correspondance, dans l'ordre : le premier motif qui accroche
 * gagne. Relevée sur ce que le serveur produit aujourd'hui, et vérifiée en
 * direct pour la moitié des lignes.
 */
const RULES: {
  test: RegExp;
  build: (
    m: RegExpMatchArray,
    c: PricingGridContent | null,
  ) => Omit<GridIssue, 'raw'>;
}[] = [
  // ── Strates
  {
    test: /^brackets: at least one bracket is required$/,
    build: () => ({
      anchor: { family: 'brackets' },
      code: 'BRACKETS_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^brackets\[0\]\.min: the first bracket must start at 0$/,
    build: () => ({
      anchor: { family: 'brackets', index: 0 },
      code: 'BRACKET_FIRST_AT_ZERO',
      params: {},
    }),
  },
  {
    test: /^brackets: the last bracket must be open-ended$/,
    build: (_m, c) => ({
      anchor: { family: 'brackets', index: (c?.brackets.length ?? 1) - 1 },
      code: 'BRACKET_LAST_OPEN',
      params: {},
    }),
  },
  {
    test: /^brackets\[(\d+)\]: overlaps the previous bracket$/,
    build: (m, c) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      code: 'BRACKET_OVERLAP',
      params: { name: bracketName(c, Number(m[1])) },
    }),
  },
  {
    test: /^brackets\[(\d+)\]: leaves a gap after the previous bracket$/,
    build: (m, c) => {
      const i = Number(m[1]);
      const from = c?.brackets?.[i - 1]?.max;
      const to = c?.brackets?.[i]?.min;
      /* Nommer les tailles orphelines : « il manque un intervalle » ne dit pas
         lequel, et c'est précisément ce qu'il faut corriger. */
      /* La plage n'est nommée que si elle en est une. Le serveur peut
         signaler le trou sur un contenu que l'écran n'a pas sous les yeux —
         un import, une version préparée ailleurs — et les bornes lues ici
         donneraient alors « entre 501 et 500 habitants ». */
      const named =
        typeof from === 'number' && typeof to === 'number' && to - 1 >= from + 1;
      return {
        anchor: { family: 'brackets', index: i },
        code: 'BRACKET_GAP',
        params: (named
          ? { from: (from as number) + 1, to: (to as number) - 1 }
          : {}) as Record<string, string | number>,
      };
    },
  },
  {
    test: /^brackets\[(\d+)\]: max is below min$/,
    build: (m) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      code: 'BRACKET_MAX_BELOW_MIN',
      params: {},
    }),
  },
  {
    test: /^brackets\[(\d+)\]\.label: required$/,
    build: (m) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      code: 'BRACKET_LABEL_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^brackets: at most (\d+) brackets$/,
    build: (m) => ({
      anchor: { family: 'brackets' },
      code: 'BRACKETS_AT_MOST',
      params: { max: Number(m[1]) },
    }),
  },

  // ── Formules
  {
    test: /^plans: "([^"]+)" is a reserved name$/,
    build: (m) => ({
      anchor: { family: 'plans', plan: m[1] },
      code: 'PLAN_RESERVED',
      params: { plan: m[1] },
    }),
  },
  {
    test: /^plans: duplicate name/,
    build: () => ({
      anchor: { family: 'plans' },
      code: 'PLAN_DUPLICATE',
      params: {},
    }),
  },
  {
    test: /^plans: names? (are|is) required/,
    build: () => ({
      anchor: { family: 'plans' },
      code: 'PLAN_NAME_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^plans: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'plans' },
      code: 'PLANS_AT_MOST',
      params: { max: Number(m[1]) },
    }),
  },

  // ── Abonnement
  {
    test: /^subscription\.([^:]+): (\d+) prices for (\d+) brackets$/,
    build: (m, c) => ({
      anchor: { family: 'subscription', plan: m[1], bracket: Number(m[2]) },
      code:
        Number(m[2]) < Number(m[3])
          ? 'SUBSCRIPTION_MISSING_PRICE'
          : 'SUBSCRIPTION_EXTRA_PRICE',
      params: { plan: m[1], bracket: bracketName(c, Number(m[2])) },
    }),
  },
  {
    test: /^subscription\.([^:]+): no such plan$/,
    build: (m) => ({
      anchor: { family: 'subscription', plan: m[1] },
      /* Le serveur refuse plutôt que d'ignorer : un prix laissé derrière une
         formule supprimée ressusciterait d'anciens tarifs le jour où le nom
         revient. Cet écran nettoie donc en supprimant la formule. */
      code: 'SUBSCRIPTION_NO_SUCH_PLAN',
      params: { plan: m[1] },
    }),
  },

  // ── Options
  {
    test: /^options\[(\d+)\]\.unitPrice: (\d+) prices for (\d+) brackets$/,
    build: (m, c) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      code: 'OPTION_MISSING_PRICE',
      params: {
        option: optionName(c, Number(m[1])),
        bracket: bracketName(c, Number(m[2])),
      },
    }),
  },
  {
    test: /^options\[(\d+)\]\.name: required$/,
    build: (m) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      code: 'OPTION_NAME_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^options\[(\d+)\]\.included: must be a number/,
    build: (m, c) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      code: 'OPTION_INCLUDED_INVALID',
      params: { option: optionName(c, Number(m[1])) },
    }),
  },
  {
    test: /^options: duplicate id$/,
    build: () => ({
      anchor: { family: 'options' },
      code: 'OPTION_DUPLICATE_ID',
      params: {},
    }),
  },
  {
    test: /^options: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'options' },
      code: 'OPTIONS_AT_MOST',
      params: { max: Number(m[1]) },
    }),
  },

  // ── Frais de mise en place
  {
    test: /^setupFees\.([^.]+)\.label: required$/,
    build: (m) => ({
      anchor: { family: 'setupFees', key: m[1] },
      code: 'SETUP_LABEL_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.nature: TRAINING or SETUP required$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1] },
      code: 'SETUP_NATURE_REQUIRED',
      params: { post: postName(c, m[1]) },
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): no such plan$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      code: 'SETUP_NO_SUCH_PLAN',
      params: { post: postName(c, m[1]), plan: m[2] },
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): missing price table$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      code: 'SETUP_MISSING_TABLE',
      params: { post: postName(c, m[1]), plan: m[2] },
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): (\d+) prices for (\d+) brackets$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      code: 'SETUP_MISSING_PRICE',
      params: {
        post: postName(c, m[1]),
        plan: m[2],
        bracket: bracketName(c, Number(m[3])),
      },
    }),
  },
  {
    test: /^setupFees: duplicate label$/,
    build: () => ({
      anchor: { family: 'setupFees' },
      /* L'unicité n'est pas cosmétique : un devis figé reventile ses lignes
         stockées par libellé, et deux postes homonymes y seraient
         indiscernables. */
      code: 'SETUP_DUPLICATE_LABEL',
      params: {},
    }),
  },
  {
    test: /^setupFees: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'setupFees' },
      code: 'SETUP_AT_MOST',
      params: { max: Number(m[1]) },
    }),
  },

  // ── Prestations libres
  {
    test: /^extras\[(\d+)\]\.unitPrice: must be a number/,
    build: (m, c) => ({
      anchor: { family: 'extras', index: Number(m[1]) },
      code: 'EXTRA_PRICE_INVALID',
      params: { extra: extraName(c, Number(m[1])) },
    }),
  },
  {
    test: /^extras\[(\d+)\]\.name: required$/,
    build: (m) => ({
      anchor: { family: 'extras', index: Number(m[1]) },
      code: 'EXTRA_NAME_REQUIRED',
      params: {},
    }),
  },
  {
    test: /^extras: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'extras' },
      code: 'EXTRAS_AT_MOST',
      params: { max: Number(m[1]) },
    }),
  },
];

/**
 * Traduit ce que le serveur refuse, sans jamais rendre la chaîne brute.
 *
 * Un chemin non prévu garde `family: 'unknown'` et son `raw` : l'écran le
 * compte dans son repli générique et le montre dans le détail dépliable, au
 * lieu de se taire.
 */
export function readDetails(
  details: string[] | null | undefined,
  content: PricingGridContent | null = null,
): GridIssue[] {
  return (details ?? []).map((raw) => {
    for (const rule of RULES) {
      const m = raw.match(rule.test);
      if (m) return { ...rule.build(m, content), raw };
    }
    return { anchor: { family: 'unknown' }, code: 'UNKNOWN', params: {}, raw };
  });
}

/** Combien de ces anomalies l'écran ne sait pas nommer. */
export function unknownCount(issues: GridIssue[]): number {
  return issues.filter((i) => i.code === 'UNKNOWN').length;
}
