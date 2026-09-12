/**
 * Exceptions individuelles de droits — US-00-05 §4.
 *
 * Un rôle décrit une fonction, une exception traite un cas particulier : « ce
 * commercial-là valide les devis », « ce consultant-là n'exporte pas ». Le
 * serveur applique **retrait > ajout > rôle** — un retrait gagne toujours.
 *
 * `PATCH /users/:id/overrides` remplace **tout** l'ensemble, avec deux
 * tableaux obligatoires `{ added, removed }`. Le handoff annonçait
 * `{ overrides: [{ code, granted }] }` : relevé faux dans `set-overrides.dto.ts`,
 * et l'API refusant les propriétés inconnues, cette forme serait rejetée.
 */
export const OVERRIDES_UI = {
  CARD: {
    TITLE: 'Exceptions de droits',
    /** Le décompte se lit tel quel : « 2 accordés, 1 retiré ». */
    NONE: 'Cette personne a exactement les droits de son rôle.',
    SOME: (added: number, removed: number) =>
      [
        added > 0 ? `${added} accordé${added > 1 ? 's' : ''} en plus` : null,
        removed > 0 ? `${removed} retiré${removed > 1 ? 's' : ''}` : null,
      ]
        .filter(Boolean)
        .join(', '),
    ACTION: 'Ajuster les droits',
  },

  DRAWER: {
    TITLE: (name: string) => `Droits de ${name}`,
    /** Dire la règle avant la matrice : elle décide de tout le reste. */
    LEAD:
      'Un retrait gagne toujours sur un ajout, et un ajout sur le rôle. Ce qui reste « hérité » suit le rôle et changera avec lui.',
    /** Le décompte d'un module replié : combien de droits s'écartent du rôle. */
    MODULE_COUNT: (adjusted: number, total: number) =>
      adjusted > 0 ? `${adjusted} / ${total}` : `— / ${total}`,
    DIRTY: (n: number) =>
      `${n} modification${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''}`,
    SAVE: 'Enregistrer les exceptions',
    CANCEL: 'Annuler',
    EDIT: 'Modifier les exceptions',
    DONE: 'Exceptions enregistrées.',
  },

  /**
   * Les trois états d'un droit, du point de vue de la personne.
   *
   * « Hérité » n'est pas « aucun » : il veut dire « ce que le rôle dit », et
   * ce que le rôle dit peut changer demain. C'est la distinction que l'écran
   * doit rendre lisible, sans quoi on croit figer un droit en le laissant
   * hérité.
   */
  STATE: {
    INHERITED: {
      LABEL: 'Hérité',
      HINT: 'Suit le rôle : accordé si le rôle l’accorde, et changera avec lui.',
    },
    GRANTED: {
      LABEL: 'Accordé',
      HINT: 'Accordé à cette personne seule, en plus de son rôle.',
    },
    REMOVED: {
      LABEL: 'Retiré',
      HINT: 'Retiré à cette personne seule, même si son rôle l’accorde.',
    },
  },

  ERRORS: {
    SAVE: 'Impossible d’enregistrer les exceptions.',
    /** Sans `roles:read`, ni le catalogue ni les droits du rôle ne se lisent. */
    NEEDS_ROLES_READ:
      'L’ajustement des droits demande aussi l’accès aux rôles du projet.',
  },
} as const;

/** L'état d'un droit pour cette personne, tel que la matrice le manipule. */
export const OVERRIDE_STATES = ['INHERITED', 'GRANTED', 'REMOVED'] as const;
export type OverrideState = (typeof OVERRIDE_STATES)[number];
