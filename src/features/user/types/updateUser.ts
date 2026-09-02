/**
 * PATCH /users/:id (US-00-05).
 *
 * Le statut ne se modifie pas ici : l'API refuse `status` (« property status
 * should not exist »). Suspendre passe par `DELETE /users/:id`, reactiver par
 * un nouveau `POST /users`. `null` retire explicitement le perimetre ou la
 * date d'expiration.
 */
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  initials?: string;
  roleCode?: string;
  scopeId?: string | null;
  expiresAt?: string | null;
};

export type UpdateUserResponse = {
  id: string;
  email: string;
};
