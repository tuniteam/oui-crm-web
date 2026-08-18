/**
 * Generic UI labels and defaults for the shared ImageCropDialog.
 * Each feature can override these via props if more specific wording is needed
 * (e.g. "Recadrer la photo de l'enfant" vs "Recadrer la photo de profil").
 */
export const IMAGE_CROP = {
  TITLE: "Recadrer l'image",
  DESCRIPTION:
    "Ajustez la zone visible en zoomant et en déplaçant l'image.",
  ZOOM_LABEL: 'Zoom',
  CONFIRM: 'Valider le recadrage',
  CANCEL: 'Annuler',

  // Defaults — overridable per usage
  DEFAULT_OUTPUT_SIZE_PX: 512,
  DEFAULT_OUTPUT_QUALITY: 0.9,
  DEFAULT_MAX_ZOOM: 3,
} as const;
