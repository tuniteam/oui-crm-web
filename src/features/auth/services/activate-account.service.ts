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
    const res = await api.get<ActivationValidateResponse>(
      AUTH_ROUTES.ACTIVATION_VALIDATE,
      { params: { token } },
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