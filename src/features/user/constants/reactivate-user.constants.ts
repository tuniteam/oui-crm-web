/**
 * Rétablir l'accès d'un utilisateur suspendu — US-00-05 §8.
 *
 * La carte prend la place de « Retrait du projet » quand le statut est
 * `SUSPENDED` : un accès déjà suspendu ne se retire pas une seconde fois, et
 * `suspend()` côté API ne vérifie pas le statut de départ — elle répondrait
 * `204` sans rien changer, en écrivant une ligne d'audit trompeuse. Un seul
 * endroit, deux visages selon l'état.
 */
export const REACTIVATE_USER_UI = {
  CARD: {
    TITLE: 'Accès suspendu',
    /** Dire ce que l'état signifie vraiment, du point de vue de la personne. */
    DESCRIPTION:
      'Cette personne peut se connecter, mais ne dispose plus d’aucun droit sur ce projet.',
    ACTION: "Réactiver l'accès",
  },
  /** Le rôle et le périmètre enregistrés repartent tels quels. */
  DONE: (firstName: string) => `Accès rétabli pour ${firstName}.`,
  ERROR: "Impossible de rétablir l'accès.",
} as const;
