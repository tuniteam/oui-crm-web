/** Routes [P] : elles exigent l'en-tete x-project-id. */
export const SETTINGS_API = {
  SETTINGS: '/settings',
  DOCUMENTS: '/settings/documents',
  SIGNATURE_IMAGE: '/settings/signature-image',
  /** Telechargement d'un fichier stocke (URL presignee). */
  FILE_DOWNLOAD: (fileId: string) => `/files/${fileId}/download`,
} as const;
