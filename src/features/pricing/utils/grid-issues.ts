import { formatInteger } from '@/shared/utils/string-utils';
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
 */

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
  /** Le message en français, devant le champ. */
  text: string;
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
  ) => { anchor: IssueAnchor; text: string };
}[] = [
  // ── Strates
  {
    test: /^brackets: at least one bracket is required$/,
    build: () => ({
      anchor: { family: 'brackets' },
      text: 'Définissez au moins une strate.',
    }),
  },
  {
    test: /^brackets\[0\]\.min: the first bracket must start at 0$/,
    build: () => ({
      anchor: { family: 'brackets', index: 0 },
      text: 'La première strate doit commencer à 0 habitant.',
    }),
  },
  {
    test: /^brackets: the last bracket must be open-ended$/,
    build: (_m, c) => ({
      anchor: { family: 'brackets', index: (c?.brackets.length ?? 1) - 1 },
      text: 'La dernière strate doit rester ouverte (« et plus »).',
    }),
  },
  {
    test: /^brackets\[(\d+)\]: overlaps the previous bracket$/,
    build: (m, c) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      text: `La strate « ${bracketName(c, Number(m[1]))} » empiète sur la précédente.`,
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
      const between = named
        ? ` entre ${formatInteger((from as number) + 1)} et ${formatInteger((to as number) - 1)} habitants`
        : '';
      return {
        anchor: { family: 'brackets', index: i },
        text: `Il manque les tailles${between} : aucune commune de cette taille ne pourrait être chiffrée.`,
      };
    },
  },
  {
    test: /^brackets\[(\d+)\]: max is below min$/,
    build: (m) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      text: 'Le maximum est inférieur au minimum.',
    }),
  },
  {
    test: /^brackets\[(\d+)\]\.label: required$/,
    build: (m) => ({
      anchor: { family: 'brackets', index: Number(m[1]) },
      text: 'Donnez un nom à cette strate.',
    }),
  },
  {
    test: /^brackets: at most (\d+) brackets$/,
    build: (m) => ({
      anchor: { family: 'brackets' },
      text: `Une grille ne peut pas dépasser ${m[1]} strates.`,
    }),
  },

  // ── Formules
  {
    test: /^plans: "([^"]+)" is a reserved name$/,
    build: (m) => ({
      anchor: { family: 'plans', plan: m[1] },
      text: `« ${m[1]} » est un nom réservé : c'est un attribut des postes de frais, qui partagent leur objet avec les prix par formule.`,
    }),
  },
  {
    test: /^plans: duplicate name/,
    build: () => ({
      anchor: { family: 'plans' },
      text: 'Deux formules portent le même nom.',
    }),
  },
  {
    test: /^plans: names? (are|is) required/,
    build: () => ({
      anchor: { family: 'plans' },
      text: 'Une formule ne peut pas être sans nom.',
    }),
  },
  {
    test: /^plans: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'plans' },
      text: `Une grille ne peut pas dépasser ${m[1]} formules.`,
    }),
  },

  // ── Abonnement
  {
    test: /^subscription\.([^:]+): (\d+) prices for (\d+) brackets$/,
    build: (m, c) => {
      const missing = bracketName(c, Number(m[2]));
      return {
        anchor: { family: 'subscription', plan: m[1], bracket: Number(m[2]) },
        text:
          Number(m[2]) < Number(m[3])
            ? `Formule « ${m[1]} » : il manque un prix à partir de la strate « ${missing} ».`
            : `Formule « ${m[1]} » : il y a plus de prix que de strates.`,
      };
    },
  },
  {
    test: /^subscription\.([^:]+): no such plan$/,
    build: (m) => ({
      anchor: { family: 'subscription', plan: m[1] },
      /* Le serveur refuse plutôt que d'ignorer : un prix laissé derrière une
         formule supprimée ressusciterait d'anciens tarifs le jour où le nom
         revient. Cet écran nettoie donc en supprimant la formule. */
      text: `Des prix d'abonnement subsistent pour la formule « ${m[1]} », qui n'existe plus.`,
    }),
  },

  // ── Options
  {
    test: /^options\[(\d+)\]\.unitPrice: (\d+) prices for (\d+) brackets$/,
    build: (m, c) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      text: `Option « ${optionName(c, Number(m[1]))} » : il manque un prix à partir de la strate « ${bracketName(c, Number(m[2]))} ».`,
    }),
  },
  {
    test: /^options\[(\d+)\]\.name: required$/,
    build: (m) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      text: 'Donnez un nom à cette option.',
    }),
  },
  {
    test: /^options\[(\d+)\]\.included: must be a number/,
    build: (m, c) => ({
      anchor: { family: 'options', index: Number(m[1]) },
      text: `Option « ${optionName(c, Number(m[1]))} » : le quota inclus doit être un nombre positif ou nul.`,
    }),
  },
  {
    test: /^options: duplicate id$/,
    build: () => ({
      anchor: { family: 'options' },
      text: 'Deux options portent le même identifiant.',
    }),
  },
  {
    test: /^options: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'options' },
      text: `Une grille ne peut pas dépasser ${m[1]} options.`,
    }),
  },

  // ── Frais de mise en place
  {
    test: /^setupFees\.([^.]+)\.label: required$/,
    build: (m) => ({
      anchor: { family: 'setupFees', key: m[1] },
      text: 'Donnez un libellé à ce poste.',
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.nature: TRAINING or SETUP required$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1] },
      text: `Le poste « ${postName(c, m[1])} » est-il de la formation ou de la mise en place ? C'est ce choix qui répartit le montant dans le récapitulatif pluriannuel.`,
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): no such plan$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      text: `Le poste « ${postName(c, m[1])} » garde des prix pour la formule « ${m[2]} », qui n'existe plus.`,
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): missing price table$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      text: `Le poste « ${postName(c, m[1])} » n'a pas de prix pour la formule « ${m[2]} ».`,
    }),
  },
  {
    test: /^setupFees\.([^.]+)\.([^:]+): (\d+) prices for (\d+) brackets$/,
    build: (m, c) => ({
      anchor: { family: 'setupFees', key: m[1], plan: m[2] },
      text: `Poste « ${postName(c, m[1])} », formule « ${m[2]} » : il manque un prix à partir de la strate « ${bracketName(c, Number(m[3]))} ».`,
    }),
  },
  {
    test: /^setupFees: duplicate label$/,
    build: () => ({
      anchor: { family: 'setupFees' },
      /* L'unicité n'est pas cosmétique : un devis figé reventile ses lignes
         stockées par libellé, et deux postes homonymes y seraient
         indiscernables. */
      text: 'Deux postes de frais portent le même libellé : un devis déjà émis ne saurait plus les distinguer.',
    }),
  },
  {
    test: /^setupFees: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'setupFees' },
      text: `Une grille ne peut pas dépasser ${m[1]} postes de frais.`,
    }),
  },

  // ── Prestations libres
  {
    test: /^extras\[(\d+)\]\.unitPrice: must be a number/,
    build: (m, c) => ({
      anchor: { family: 'extras', index: Number(m[1]) },
      text: `Prestation « ${extraName(c, Number(m[1]))} » : le prix doit être un nombre positif ou nul.`,
    }),
  },
  {
    test: /^extras\[(\d+)\]\.name: required$/,
    build: (m) => ({
      anchor: { family: 'extras', index: Number(m[1]) },
      text: 'Donnez un nom à cette prestation.',
    }),
  },
  {
    test: /^extras: at most (\d+)/,
    build: (m) => ({
      anchor: { family: 'extras' },
      text: `Une grille ne peut pas dépasser ${m[1]} prestations.`,
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
export function translateDetails(
  details: string[] | null | undefined,
  content: PricingGridContent | null = null,
): GridIssue[] {
  return (details ?? []).map((raw) => {
    for (const rule of RULES) {
      const m = raw.match(rule.test);
      if (m) return { ...rule.build(m, content), raw };
    }
    return { anchor: { family: 'unknown' } as IssueAnchor, text: '', raw };
  });
}

/** Combien de ces anomalies l'écran ne sait pas nommer. */
export function unknownCount(issues: GridIssue[]): number {
  return issues.filter((i) => i.anchor.family === 'unknown').length;
}
