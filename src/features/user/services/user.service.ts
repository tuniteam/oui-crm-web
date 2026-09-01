import { getApiErrorMessage } from '@/shared/utils/api-error';
import api from '@/config/axiosInstance';
import { ME_ROUTES, USER_ROUTES } from '../constants/user.routes';
import type {
  CorrectEmailPayload,
  CorrectEmailResponse,
} from '../types/correctEmail';
import { CreateUserPayload, CreateUserResponse } from '../types/createUser';
import type { MeResponse } from '../types/me';
import { UpdateUserPayload, UpdateUserResponse } from '../types/updateUser';
import { UserDetailsResponse } from '../types/userDetails';
import { UserListParams, UserListResponse } from '../types/userList';


export const userService = {
  me: async (): Promise<MeResponse> => {
    try {
      // /profile/me repond a plat, sans enveloppe { data } (verifie en reel).
      const res = await api.get<MeResponse>(ME_ROUTES.ME_API);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  getAll: async (params: UserListParams): Promise<UserListResponse> => {
    try {
      const res = await api.get<UserListResponse>(USER_ROUTES.USERS_API, {
        params,
      });
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  create: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    try {
      const res = await api.post<CreateUserResponse>(
        USER_ROUTES.USERS_API,
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  getOne: async (userId: string): Promise<UserDetailsResponse> => {
    try {
      const res = await api.get<UserDetailsResponse>(
        `${USER_ROUTES.USERS_API}/${userId}`,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  update: async (
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<UpdateUserResponse> => {
    try {
      const res = await api.patch<UpdateUserResponse>(
        USER_ROUTES.USER_UPDATE_API(userId),
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  // Volontairement non wrappé par getApiErrorMessage : le hook a besoin du
  // code d'erreur brut (EMAIL_UNCHANGED, EMAIL_ALREADY_TAKEN, ...).
  correctEmail: async (
    userId: string,
    payload: CorrectEmailPayload,
  ): Promise<CorrectEmailResponse> => {
    const res = await api.patch<CorrectEmailResponse>(
      USER_ROUTES.USER_CORRECT_EMAIL_API(userId),
      payload,
    );
    return res.data;
  },
  delete: async (userId: string): Promise<void> => {
    try {
      await api.delete(`${USER_ROUTES.USERS_API}/${userId}`);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  /** Renvoie l'e-mail d'activation d'un compte encore PENDING. */
  resendActivation: async (userId: string): Promise<{ sent: boolean }> => {
    try {
      const res = await api.post<{ sent: boolean }>(
        USER_ROUTES.USER_RESEND_ACTIVATION_API(userId),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
  
 
};
