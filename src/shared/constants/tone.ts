import type { BadgeProps } from '@/components/ui/badge';

/**
 * Ton d'une valeur metier : la couleur qu'elle porte a l'ecran.
 *
 * Le type est celui de `Badge`, pas une enumeration parallele — une couleur
 * ajoutee au composant devient utilisable ici sans rien redeclarer, et une
 * couleur retiree casse la compilation plutot que l'affichage.
 *
 * Chaque vocabulaire metier declare sa table a cote de ses libelles, dans sa
 * feature. Aucun composant ne choisit sa teinte : il lit la table. C'est ce
 * qui garantit qu'une meme valeur porte la meme couleur dans la liste, dans
 * la fiche et dans l'agenda.
 */
export type Tone = NonNullable<BadgeProps['variant']>;

/** Ton d'une valeur absente de la table : neutre, jamais une couleur au hasard. */
export const NEUTRAL_TONE: Tone = 'secondary';

/**
 * Lit un ton dans sa table.
 *
 * Une valeur inconnue — un referentiel enrichi cote serveur, une enumeration
 * elargie — sort en neutre plutot qu'en `undefined`, qui rendrait la pastille
 * dans la couleur par defaut du composant sans que personne ne s'en apercoive.
 */
export function toneOf<K extends string>(
  table: Partial<Record<K, Tone>>,
  value: K | null | undefined,
): Tone {
  if (!value) return NEUTRAL_TONE;
  return table[value] ?? NEUTRAL_TONE;
}
