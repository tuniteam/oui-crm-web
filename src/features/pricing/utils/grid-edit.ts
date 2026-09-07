import { formatInteger } from '@/shared/utils/string-utils';
import {
  PRICING_LIMITS,
  RESERVED_PLAN_NAMES,
  type PricingGridContent,
  type SetupFeeNature,
} from '../types/pricingGrid';

/**
 * Ajouter et retirer les éléments d'une grille — L2 · US-02-01, SPEC-19.
 *
 * Des fonctions pures, hors de tout rendu : ce sont elles qui portent les
 * invariants que le serveur exige, et c'est ici qu'ils se vérifient sans
 * monter un écran.
 *
 * **Le contenu se poste en entier.** Ajouter ou retirer un élément, c'est
 * envoyer le document avec un élément de plus ou de moins ; il n'existe
 * aucune route par élément.
 */

/**
 * Le libelle d'une strate, au format que le projet emploie deja.
 *
 * Constate en base : « 0 – 500 hab. », et « Plus de 10 000 hab. » pour la
 * strate ouverte, qui nomme donc `min - 1`. Le tiret est un demi-cadratin.
 *
 * **Le libelle suit les bornes.** Il n'est pas cosmetique : un devis fige
 * reventile ses lignes par libelle, et `?bracket=` filtre dessus. Elargir une
 * strate sans le refaire laisserait « 501 – 1 000 hab. » sur une strate qui
 * couvre desormais jusqu'a 2 500 — le serveur l'accepte, l'ecran mentirait.
 */
export function bracketLabel(min: number, max: number | null): string {
  return max === null
    ? `Plus de ${formatInteger(min - 1)} hab.`
    : `${formatInteger(min)} – ${formatInteger(max)} hab.`;
}

/**
 * Le nom d'un element qu'on vient d'ajouter.
 *
 * Jamais vide : le serveur exige `name` et `label`, et les refuse en anglais
 * a l'enregistrement. Un nom par defaut se relit et se remplace ; un champ
 * vide se perd de vue et fait echouer la sauvegarde de toute la grille.
 */
const NEW_NAMES = {
  OPTION: 'Nouvelle option',
  EXTRA: 'Nouvelle prestation',
} as const;

/** Toutes les valeurs par strate d'un contenu, en un seul endroit. */
function eachPriceRow(
  c: PricingGridContent,
  visit: (row: number[]) => number[],
): void {
  for (const plan of c.plans) {
    if (c.subscription[plan]) c.subscription[plan] = visit(c.subscription[plan]);
  }
  for (const o of c.options ?? []) o.unitPrice = visit(o.unitPrice);
  for (const post of Object.values(c.setupFees ?? {})) {
    for (const plan of c.plans) {
      const row = post[plan];
      if (Array.isArray(row)) post[plan] = visit(row);
    }
  }
  /* `extras` n'est pas visité : ses prix sont des scalaires, c'est la seule
     famille indépendante des strates. */
}

/**
 * Insère une strate en **coupant** celle du rang donné en deux.
 *
 * La coupe est ce qui rend les quatre règles du serveur inviolables : la
 * couverture reste `[0, +∞[`, sans trou ni chevauchement, et la strate ouverte
 * reste la dernière. Laisser saisir des bornes libres puis contrôler après
 * coup reviendrait à faire découvrir la règle par un refus.
 *
 * La nouvelle strate **hérite des prix de celle qu'elle coupe**, insérés au
 * même indice partout. C'est l'invariant que le serveur ne peut pas voir :
 * ajouter la valeur en fin de tableau donnerait des longueurs correctes, des
 * bornes croissantes, un contenu accepté — et toute la grille décalée d'un
 * cran.
 */
export function addBracket(
  c: PricingGridContent,
  index: number,
): PricingGridContent {
  const cut = c.brackets[index];
  if (!cut) return c;

  /* Une strate ouverte se coupe à une borne arbitraire mais franche ; une
     strate fermée, en son milieu. L'utilisateur corrige ensuite les bornes,
     et c'est `setBracketBound` qui garde la chaîne cohérente. */
  const boundary =
    cut.max === null ? cut.min + 1000 : cut.min + Math.floor((cut.max - cut.min) / 2);

  const before = {
    ...cut,
    max: boundary,
    label: bracketLabel(cut.min, boundary),
  };
  const after = {
    ...cut,
    min: boundary + 1,
    max: cut.max,
    label: bracketLabel(boundary + 1, cut.max),
  };

  const next = { ...c, brackets: [...c.brackets] };
  next.brackets.splice(index, 1, before, after);
  eachPriceRow(next, (row) => {
    const copy = [...row];
    copy.splice(index + 1, 0, row[index] ?? 0);
    return copy;
  });
  return next;
}

/**
 * Retire une strate en **rendant sa plage à sa voisine**.
 *
 * La plage ne disparaît pas : la strate précédente s'étend jusqu'à l'ancienne
 * borne haute, ou, s'il s'agissait de la première, la suivante redescend à 0.
 * Retirer sans recoudre laisserait un trou, que le serveur refuse — et qui,
 * avant SPEC-19, donnait `bracketLabel: null` sur les fiches concernées.
 */
export function removeBracket(
  c: PricingGridContent,
  index: number,
): PricingGridContent {
  if (c.brackets.length <= 1) return c;

  const gone = c.brackets[index];
  const next = { ...c, brackets: c.brackets.filter((_, i) => i !== index) };

  if (index === 0) {
    next.brackets[0] = {
      ...next.brackets[0],
      min: 0,
      label: bracketLabel(0, next.brackets[0].max),
    };
  } else {
    const prev = next.brackets[index - 1];
    next.brackets[index - 1] = {
      ...prev,
      max: gone.max,
      label: bracketLabel(prev.min, gone.max),
    };
  }

  eachPriceRow(next, (row) => row.filter((_, i) => i !== index));
  return next;
}

/**
 * Déplace une borne, et recoud la voisine dans le même geste.
 *
 * Les bornes d'une grille ne sont pas indépendantes : `max` d'une strate et
 * `min` de la suivante sont **la même borne**, vue des deux côtés. Les laisser
 * saisir séparément, comme le faisait l'écran, produit un trou ou un
 * chevauchement dès la première frappe.
 */
export function setBracketBound(
  c: PricingGridContent,
  index: number,
  max: number | null,
): PricingGridContent {
  const brackets = [...c.brackets];
  const here = brackets[index];
  if (!here) return c;

  /* La dernière strate reste ouverte : sa borne haute ne se saisit pas. */
  if (index === brackets.length - 1) return c;

  brackets[index] = { ...here, max, label: bracketLabel(here.min, max) };
  const nextMin = max === null ? brackets[index + 1].min : max + 1;
  brackets[index + 1] = {
    ...brackets[index + 1],
    min: nextMin,
    label: bracketLabel(nextMin, brackets[index + 1].max),
  };
  return { ...c, brackets };
}

/**
 * Ajoute une formule, avec sa colonne de prix partout.
 *
 * Une formule sans table de prix est refusée (`missing price table`), tout
 * comme une table sans formule (`no such plan`) : les deux vivent ensemble ou
 * pas du tout.
 */
export function addPlan(
  c: PricingGridContent,
  name: string,
): PricingGridContent {
  const clean = name.trim();
  if (!clean || c.plans.includes(clean)) return c;

  const next: PricingGridContent = {
    ...c,
    plans: [...c.plans, clean],
    subscription: { ...c.subscription, [clean]: c.brackets.map(() => 0) },
  };
  if (next.setupFees) {
    next.setupFees = Object.fromEntries(
      Object.entries(next.setupFees).map(([k, post]) => [
        k,
        { ...post, [clean]: c.brackets.map(() => 0) },
      ]),
    );
  }
  return next;
}

/**
 * Retire une formule **et toutes ses tables de prix**.
 *
 * Le serveur ne nettoie pas en silence — sans quoi ré-ajouter la formule
 * ressusciterait ses anciens prix, que personne n'aurait revus. Il renvoie
 * donc une erreur par table oubliée : quatre d'un coup sur la grille de
 * démonstration. Ce nettoyage est le geste de l'écran, pas celui de
 * l'utilisateur.
 */
export function removePlan(
  c: PricingGridContent,
  name: string,
): PricingGridContent {
  if (c.plans.length <= 1) return c;

  /* La cle disparait par omission : `delete` sur une copie ferait le meme
     effet, en mutant. */
  const subscription = Object.fromEntries(
    Object.entries(c.subscription).filter(([plan]) => plan !== name),
  );
  const next: PricingGridContent = {
    ...c,
    plans: c.plans.filter((p) => p !== name),
    subscription,
  };
  if (next.setupFees) {
    next.setupFees = Object.fromEntries(
      Object.entries(next.setupFees).map(([k, post]) => [
        k,
        Object.fromEntries(
          Object.entries(post).filter(([field]) => field !== name),
        ) as typeof post,
      ]),
    );
  }
  return next;
}

/**
 * Une option nouvelle part **sans `id`** : le serveur le lui donne.
 *
 * Elle part aussi avec un nom : `options[].name` est requis
 * (`options[6].name: required`, constate en direct), et un champ laisse vide
 * ne serait refuse qu'a l'enregistrement, en anglais.
 */
export function addOption(c: PricingGridContent): PricingGridContent {
  return {
    ...c,
    options: [
      ...(c.options ?? []),
      { name: NEW_NAMES.OPTION, unitPrice: c.brackets.map(() => 0) },
    ],
  };
}

export function removeOption(
  c: PricingGridContent,
  index: number,
): PricingGridContent {
  return { ...c, options: (c.options ?? []).filter((_, i) => i !== index) };
}

export function addExtra(c: PricingGridContent): PricingGridContent {
  return {
    ...c,
    extras: [...(c.extras ?? []), { name: NEW_NAMES.EXTRA, unitPrice: 0 }],
  };
}

export function removeExtra(
  c: PricingGridContent,
  index: number,
): PricingGridContent {
  return { ...c, extras: (c.extras ?? []).filter((_, i) => i !== index) };
}

/**
 * Ajoute un poste de frais.
 *
 * Sa **clé** est fabriquée ici et ne se voit jamais à l'écran : elle n'a plus
 * de rôle métier depuis que `nature` porte la ventilation, mais elle reste
 * l'adresse du poste dans l'objet. On la tire du libellé, en la rendant
 * unique — deux postes homonymes sont de toute façon refusés.
 */
export function addSetupFee(
  c: PricingGridContent,
  label: string,
  nature: SetupFeeNature,
): PricingGridContent {
  const clean = label.trim();
  if (!clean) return c;

  const base =
    clean
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'poste';
  const taken = new Set(Object.keys(c.setupFees ?? {}));
  let key = base;
  for (let n = 2; taken.has(key); n += 1) key = `${base}-${n}`;

  return {
    ...c,
    setupFees: {
      ...(c.setupFees ?? {}),
      [key]: {
        label: clean,
        nature,
        ...Object.fromEntries(c.plans.map((p) => [p, c.brackets.map(() => 0)])),
      },
    },
  };
}

export function removeSetupFee(
  c: PricingGridContent,
  key: string,
): PricingGridContent {
  return {
    ...c,
    setupFees: Object.fromEntries(
      Object.entries(c.setupFees ?? {}).filter(([k]) => k !== key),
    ),
  };
}

/** Le poste est-il encore ajoutable, ou le plafond est-il atteint ? */
export function canAdd(
  c: PricingGridContent,
  family: keyof typeof PRICING_LIMITS,
): boolean {
  const count = {
    brackets: c.brackets.length,
    plans: c.plans.length,
    options: (c.options ?? []).length,
    setupFees: Object.keys(c.setupFees ?? {}).length,
    extras: (c.extras ?? []).length,
  }[family];
  return count < PRICING_LIMITS[family];
}

/** Un nom de formule refusé d'avance, plutôt qu'après un aller-retour. */
export function planNameIssue(
  c: PricingGridContent,
  name: string,
): 'EMPTY' | 'RESERVED' | 'DUPLICATE' | null {
  const clean = name.trim();
  if (!clean) return 'EMPTY';
  /* `label` et `nature` sont les attributs d'un poste de frais, et les prix
     par formule vivent dans le même objet : une formule ainsi nommée les
     écraserait. */
  if ((RESERVED_PLAN_NAMES as readonly string[]).includes(clean))
    return 'RESERVED';
  if (c.plans.includes(clean)) return 'DUPLICATE';
  return null;
}

/**
 * Un libellé de poste refusé d'avance.
 *
 * L'unicité n'est pas cosmétique : un devis figé reventile ses lignes
 * stockées **par libellé**, et deux postes homonymes y seraient
 * indiscernables.
 */
export function setupLabelIssue(
  c: PricingGridContent,
  label: string,
  exceptKey?: string,
): 'EMPTY' | 'DUPLICATE' | null {
  const clean = label.trim();
  if (!clean) return 'EMPTY';
  const taken = Object.entries(c.setupFees ?? {})
    .filter(([k]) => k !== exceptKey)
    .map(([, p]) => p.label.trim().toLowerCase());
  return taken.includes(clean.toLowerCase()) ? 'DUPLICATE' : null;
}
