export const AVATAR_EDIT_SHEET = {
  TITLE: 'Photo de profil',

  LABELS: {
    CURRENT_PHOTO: 'Photo actuelle',
    DROP_AREA: 'Glisser-déposer',
    DROP_AREA_OR: 'ou',
    DELETE_SECTION: 'Supprimer la photo',
    DELETE_DESCRIPTION:
      'Votre avatar sera remplacé par les initiales de votre nom.',
  },

  BUTTONS: {
    BROWSE: 'Parcourir...',
    DELETE: 'Supprimer la photo',
    CANCEL: 'Annuler',
    SAVE: 'Enregistrer',
  },

  LOADING_LABELS: {
    SAVING: 'Enregistrement...',
  },

  HINTS: {
    FORMATS: 'Formats acceptés : JPG, PNG',
    MAX_SIZE: "Taille maximale : 5 Mo (l'image sera recadrée et optimisée)",
  },

  ERRORS: {
    INVALID_TYPE: 'Seuls les formats JPG et PNG sont acceptés.',
    FILE_TOO_LARGE: 'La taille maximale est de 5 Mo.',
    SAVE_FAILED:
      "Le nouvel avatar n'a pas pu être enregistré. Veuillez réessayer.",
  },

  TOASTS: {
    UPLOAD_SUCCESS: 'Photo de profil mise à jour avec succès',
    DELETE_SUCCESS: 'Photo de profil supprimée avec succès',
    ERROR: 'Impossible de mettre à jour la photo de profil',
  },

  CROP: {
    TITLE: 'Recadrer la photo de profil',
    DESCRIPTION:
      "Ajustez la zone visible de votre photo en zoomant et en déplaçant l'image.",
  },

  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  OUTPUT_SIZE_PX: 512,
  OUTPUT_QUALITY: 0.9,
  ACCEPTED_MIME_TYPES: ['image/jpeg', 'image/png'] as string[],
  ACCEPTED_EXTENSIONS: '.jpg,.jpeg,.png',
} as const;
