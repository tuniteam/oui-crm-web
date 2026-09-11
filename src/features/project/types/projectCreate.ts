/** `POST /projects` — corps de la requête. Relevé dans `CreateProjectDto`. */
export type CreateProjectPayload = {
  slug: string;
  name: string;
  productName: string;
  description?: string;
  /** Copie la configuration de ce projet, jamais ses données métier. */
  copyFromProjectId?: string;
};

/** `201 Created`. */
export type CreateProjectResponse = {
  id: string;
  slug: string;
};
