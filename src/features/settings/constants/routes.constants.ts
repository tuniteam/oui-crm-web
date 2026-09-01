/** Routes [P] : elles exigent l'en-tete x-project-id. */
export const SETTINGS_API = {
  SETTINGS: '/settings',
  DOCUMENTS: '/settings/documents',
  SIGNATURE_IMAGE: '/settings/signature-image',
  REFERENCE_ITEMS: '/reference-items',
  REFERENCE_ITEM: (id: string) => `/reference-items/${id}`,
  /** Telechargement d'un fichier stocke (URL presignee). */
  FILE_DOWNLOAD: (fileId: string) => `/files/${fileId}/download`,
} as const;
