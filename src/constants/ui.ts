/**
 * Labels UI partagés (colonnes de table, placeholders)
 */
export const UI = {
  BRAND: {
    /** Nom affiche dans le bloc de marque du rail. */
    NAME: 'Oui CRM',
  },
  SIDEBAR: {
    COLLAPSE: 'Réduire le menu',
    EXPAND: 'Agrandir le menu',
    SWITCH_PROJECT: 'Changer de projet',
  },
  TIME_PICKER: {
    PICK_TIME: "Choisir l'heure",
  },
  DATE_PICKER: {
    PICK_DATE: 'Choisir une date',
  },
  THEME: {
    DARK_MODE: 'Mode sombre',
    LIGHT_MODE: 'Mode clair',
  },
  TABLE: {
    // Pour reusable-table.tsx:88
    SEARCH_PLACEHOLDER: 'Rechercher...',
    FILTERS_BUTTON: 'Filtres',
    RESET_FILTERS: 'Réinitialiser',
    ALL_TYPES_SELECT_OPTION: 'Tous les types',
    ALL_STATUSES_SELECT_OPTION: 'Tous les statuts',
    STATUS_PLACEHOLDER: 'Statut',
    TYPE_PLACEHOLDER: 'Type',

    // Pour clientColumns.tsx:44 et :74
    TYPE_COLUMN: 'Type',
    SERVICES_COLUMN: 'Services',

    //pour calendar table columns
    DATE_COLUMN: 'Date',
    LABEL_COLUMN: 'Libellé',
   
  },
  DATA_GRID: {
    COLUMN_HEADER: {
      SORT_ASC: 'Croissant',
      SORT_DESC: 'Décroissant',
      PIN_LEFT: 'Épingler à gauche',
      PIN_RIGHT: 'Épingler à droite',
      MOVE_LEFT: 'Déplacer à gauche',
      MOVE_RIGHT: 'Déplacer à droite',
      COLUMNS: 'Colonnes',
      UNPIN_COLUMN_PREFIX: 'Désépingler la colonne ',
    },
  },
} as const;
