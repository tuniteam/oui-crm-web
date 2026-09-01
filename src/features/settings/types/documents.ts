/** Types de gabarit acceptes par POST /settings/documents/{type}. */
export const TEMPLATE_TYPE_VALUES = ['QUOTE', 'CONTRACT'] as const;

export type TemplateType = (typeof TEMPLATE_TYPE_VALUES)[number];

export const TEMPLATE_TYPE = {
  QUOTE: TEMPLATE_TYPE_VALUES[0],
  CONTRACT: TEMPLATE_TYPE_VALUES[1],
} as const;

/** Gabarit actif d'un type : le dernier televerse. */
export type DocumentTemplate = {
  type: TemplateType;
  /** Rang du fichier actif, pas un numero de schema. */
  version: number;
  fileId: string;
  fileName: string;
  uploadedAt: string;
};

export type SignatureImage = {
  fileId: string;
  fileName: string;
  uploadedAt: string;
};

/**
 * Exemples calcules pour aujourd'hui avec les initiales de l'utilisateur.
 * Formats fixes cote serveur : a afficher, jamais a saisir.
 */
export type NumberingSamples = {
  quote: string;
  contract: string;
  invoice: string;
};

export type SettingsDocumentsResponse = {
  /** Un type sans televersement est absent de la liste. */
  templates: DocumentTemplate[];
  /** null tant qu'aucun cachet n'a ete depose. */
  signatureImage: SignatureImage | null;
  numbering: NumberingSamples;
};

export type UploadTemplateResponse = {
  type: TemplateType;
  version: number;
  fileId: string;
};

export type UploadSignatureResponse = {
  fileId: string;
  fileName: string;
};

/** GET /files/:fileId/download — URL presignee, valable jusqu'a `expiresAt`. */
export type FileDownloadUrl = {
  url: string;
  expiresAt: string;
};
