/**
 * POST /users (US-00-05).
 *
 * `roleCode` et non `roleId` : l'API refuse explicitement `roleId`
 * (« property roleId should not exist »). `initials` et `isExternal` sont
 * obligatoires. `expiresAt` est un jour calendaire strict `YYYY-MM-DD` —
 * une date-heure ISO est refusee.
 */
export type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  /** 2 a 3 majuscules ou chiffres : sert a numeroter les devis. */
  initials: string;
  roleCode: string;
  /** Optionnel tant que la feature « perimetres » (US-00-07) n'existe pas. */
  scopeId?: string;
  isExternal: boolean;
  /** Obligatoire si `isExternal`, sinon absent. */
  expiresAt?: string;
};

/** Le serveur rend le statut resultant, pas l'e-mail : inconnu -> `PENDING`,
 *  deja actif ailleurs -> `ACTIVE` par rattachement. */
export type CreateUserResponse = {
  id: string;
  status: string;
};
