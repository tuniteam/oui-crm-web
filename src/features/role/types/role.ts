/**
 * La matrice des rôles d'un projet — L0 · US-00-06.
 *
 * Un rôle porte un ensemble de **droits** (`module:action`), chacun avec sa
 * portée, plus une règle d'accès hors périmètre géographique. Un utilisateur
 * reçoit **un rôle par projet** ; les exceptions individuelles passent par les
 * surcharges, hors de cet écran.
 */

/**
 * La portée d'un droit.
 *
 * `ALL` existe côté serveur mais est **réservé aux rôles du back-office** :
 * l'écran ne le propose jamais, et l'API le refuse par `400 INVALID_DATA`.
 */
export const ROLE_SCOPES = ['PROJECT', 'OWN'] as const;
export type RoleScope = (typeof ROLE_SCOPES)[number];

/** Ce qu'un rôle voit hors de son périmètre géographique. */
export const OUT_OF_SCOPE_VALUES = ['NONE', 'RESTRICTED', 'FULL'] as const;
export type OutOfScopeAccess = (typeof OUT_OF_SCOPE_VALUES)[number];

/** Un droit accordé à un rôle, avec sa portée. */
export type RoleGrant = {
  code: string;
  scope: RoleScope;
};

/** `GET /roles` — le rôle super admin n'y figure jamais. */
export type Role = {
  id: string;
  /** MAJUSCULES_AVEC_UNDERSCORES, unique dans le projet, **immuable**. */
  code: string;
  label: string;
  /** Un rôle système est en lecture seule : on le duplique pour l'adapter. */
  isSystem: boolean;
  outOfScopeAccess: OutOfScopeAccess;
  permissions: RoleGrant[];
  /** Porteurs de ce rôle dans le projet — explique un refus de suppression. */
  usersCount: number;
};

/**
 * `GET /permissions` — le catalogue complet.
 *
 * **Jamais de décompte en dur** : il grandit à chaque livraison. `label` est
 * en anglais (« Validate quotes ») ; l'écran traduit depuis `module` et
 * `action`, qui sont structurés.
 */
export type PermissionItem = {
  code: string;
  module: string;
  action: string;
  label: string;
};

export type RolesListResponse = { data: Role[] };
export type PermissionsListResponse = { data: PermissionItem[] };

export type DuplicateRolePayload = { code: string; label: string };
export type DuplicateRoleResponse = { id: string; code: string };

/** `PATCH /roles/:id` — les trois champs sont facultatifs, le corps non vide. */
export type UpdateRolePayload = {
  label?: string;
  outOfScopeAccess?: OutOfScopeAccess;
  /** **Remplace tout l'ensemble** : un droit absent est un droit retiré. */
  permissions?: RoleGrant[];
};
