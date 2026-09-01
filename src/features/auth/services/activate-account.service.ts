// src/features/auth/services/activate-account.service.ts
import api from '@/config/axiosInstance';
import type {
  ActivationCompletePayload,
  ActivationCompleteResponse,
  ActivationValidateResponse,
} from '../types/auth';
import { AUTH_ROUTES } from '../constants/routes.constants';

export const activateAccountService = {
  validateToken: async (token: string): Promise<ActivationValidateResponse> => {
    // POST et non GET : un token en query string finit dans les logs serveur
    // et les proxies. Le contrat (SPEC-11 US-00-02) l'exige dans le corps.
    const res = await api.post<ActivationValidateResponse>(
      AUTH_ROUTES.ACTIVATION_VALIDATE,
      { token },
    );
    return res.data;
  },

  completeActivation: async (
    payload: ActivationCompletePayload,
  ): Promise<ActivationCompleteResponse> => {
    const res = await api.post<ActivationCompleteResponse>(
      AUTH_ROUTES.ACTIVATION_COMPLETE,
      payload,
    );
    return res.data;
  },
};