// features/auth/services/auth.service.ts
import { AxiosError } from 'axios';
import api from '@/config/axiosInstance';
import { AUTH } from '../constants/auth.constants';
import { AUTH_ROUTES } from '../constants/routes.constants';
import type {
  LoginPayload,
  LoginResponse,
  RefreshTokenResponse,
} from '../types/auth';
import { tokenService } from './token.service';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      const res = await api.post<LoginResponse>(AUTH_ROUTES.LOGIN, payload);

      // Stocker les tokens apres un login reussi
      tokenService.setTokens(res.data.accessToken, res.data.refreshToken);

      return res.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        switch (err.response?.status) {
          case 401:
            throw new Error(AUTH.ERRORS.INVALID_CREDENTIALS);
          case 403:
            throw new Error(AUTH.ERRORS.ACCOUNT_LOCKED);
          case 500:
            throw new Error(AUTH.ERRORS.SERVER);
        }
      }
      throw new Error(AUTH.ERRORS.SERVER);
    }
  },

  refresh: async (): Promise<void> => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) throw new Error(AUTH.ERRORS.NO_REFRESH_TOKEN);
      const res = await api.post<RefreshTokenResponse>(AUTH_ROUTES.REFRESH, {
        refreshToken,
      });
      tokenService.setTokens(res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      throw new Error(AUTH.ERRORS.SERVER);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(AUTH_ROUTES.LOGOUT);
    } catch {
    } finally {
      tokenService.clearTokens();
      window.location.href = '/auth/login';
    }
  },
};
