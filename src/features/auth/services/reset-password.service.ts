import api from '@/config/axiosInstance';
import { AUTH_ROUTES } from '../constants/routes.constants';
import type {
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  PasswordResetValidateResponse,
  PasswordResetCompletePayload,
  PasswordResetCompleteResponse,
} from '../types/reset-password';

export const resetPasswordService = {
  requestReset: async (
    payload: PasswordResetRequestPayload,
  ): Promise<PasswordResetRequestResponse> => {
    const res = await api.post<PasswordResetRequestResponse>(
      AUTH_ROUTES.RESET_PASSWORD_REQUEST,
      payload,
    );
    return res.data;
  },

  validateToken: async (token: string): Promise<PasswordResetValidateResponse> => {
    const res = await api.get<PasswordResetValidateResponse>(
      AUTH_ROUTES.RESET_PASSWORD_VALIDATE,
      { params: { token } },
    );
    return res.data;
  },

  resetPassword: async (
    payload: PasswordResetCompletePayload,
  ): Promise<PasswordResetCompleteResponse> => {
    const res = await api.post<PasswordResetCompleteResponse>(
      AUTH_ROUTES.RESET_PASSWORD_COMPLETE,
      payload,
    );
    return res.data;
  },
};