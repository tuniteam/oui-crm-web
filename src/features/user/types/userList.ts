import { USER_STATUS_VALUES } from '../constants/userList.constants';

/**
 * Statut composite (US-00-05) : etat du compte (PENDING/ACTIVE/INACTIVE) ou
 * affectation suspendue sur ce projet (SUSPENDED). Meme valeur pour le filtre.
 */
export type UserStatus = (typeof USER_STATUS_VALUES)[number];

/** Perimetre affecte, tel que rendu sur la ligne : id + nom, rien de plus. */
export type UserScopeLite = {
  id: string;
  name: string;
};

/** Nombre de permissions ajoutees/retirees par rapport au role. */
export type UserOverridesCount = {
  added: number;
  removed: number;
};

/**
 * Ligne de GET /users : reponse a plat, le role et le perimetre sont portes par
 * l'element lui-meme (pas de sous-objet `relationShip`, herite de soft-m).
 */
export type UserListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  status: UserStatus;
  roleCode: string;
  roleLabel: string;
  scope: UserScopeLite | null;
  /** Renseigne pour un acces externe, sinon null. */
  expiresAt: string | null;
  /** Derive de `expiresAt` cote serveur. */
  isExternal: boolean;
  overridesCount: UserOverridesCount;
  lastLoginAt: string | null;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserListResponse = {
  data: UserListItem[];
  meta: PaginationMeta;
};

export type UserListParams = {
  page?: number;
  limit?: number;
  status?: UserStatus;
  roleCode?: string;
  /** E-mail, prenom, nom ou initiales. */
  search?: string;
};
