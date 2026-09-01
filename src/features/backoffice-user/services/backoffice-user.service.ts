import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import {
  BACKOFFICE_ROLES_API,
  BACKOFFICE_USER_ROUTES,
  BACKOFFICE_USERS_API,
} from '../constants/routes.constants';
import type {
  BackofficeRolesResponse,
  BackofficeUserDetails,
  BackofficeUserListParams,
  BackofficeUserListResponse,
  CreateBackofficeUserPayload,
  CreateBackofficeUserResponse,
  UpdateBackofficeUserPayload,
} from '../types/backofficeUser';

/**
 * Comptes back-office — routes plateforme, reservees au super admin.
 * Elles ne prennent PAS l'en-tete x-project-id : un back-office les consulte
 * sans avoir selectionne de projet.
 */
export const backofficeUserService = {
  getRoles: async (): Promise<BackofficeRolesResponse> => {
    try {
      const res = await api.get<BackofficeRolesResponse>(BACKOFFICE_ROLES_API);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  getAll: async (
    params: BackofficeUserListParams,
  ): Promise<BackofficeUserListResponse> => {
    try {
      const res = await api.get<BackofficeUserListResponse>(
        BACKOFFICE_USERS_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  getOne: async (userId: string): Promise<BackofficeUserDetails> => {
    try {
      const res = await api.get<BackofficeUserDetails>(
        BACKOFFICE_USER_ROUTES.BY_ID_API(userId),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * Recreer un operateur suspendu avec le meme e-mail le reactive (201) au
   * lieu d'echouer en doublon : c'est le chemin de retour de la suspension.
   */
  create: async (
    payload: CreateBackofficeUserPayload,
  ): Promise<CreateBackofficeUserResponse> => {
    try {
      const res = await api.post<CreateBackofficeUserResponse>(
        BACKOFFICE_USERS_API,
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  update: async (
    userId: string,
    payload: UpdateBackofficeUserPayload,
  ): Promise<BackofficeUserDetails> => {
    try {
      const res = await api.patch<BackofficeUserDetails>(
        BACKOFFICE_USER_ROUTES.BY_ID_API(userId),
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  resendActivation: async (userId: string): Promise<{ sent: boolean }> => {
    try {
      const res = await api.post<{ sent: boolean }>(
        BACKOFFICE_USER_ROUTES.RESEND_ACTIVATION_API(userId),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /** Suspend l'acces, ne supprime pas le compte. Reversible par re-creation. */
  suspend: async (userId: string): Promise<void> => {
    try {
      await api.delete(BACKOFFICE_USER_ROUTES.BY_ID_API(userId));
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
