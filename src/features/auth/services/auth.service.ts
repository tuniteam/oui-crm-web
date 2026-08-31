// features/auth/services/auth.service.ts
import { AxiosError } from 'axios';
import api from '@/config/axiosInstance';
import { API_ERROR_CODE } from '@/shared/constants/api-errors';
import { AUTH } from '../constants/auth.constants';
import { AUTH_ROUTES } from '../constants/routes.constants';
import { AuthLockedError } from '../errors/AuthLockedError';
import type {
  ApiErrorResponse,
  LoginPayload,
  LoginResponse,
  RefreshTokenResponse,
} from '../types/auth';
import { tokenService } from './token.service';

/** Statuts HTTP du contrat d'authentification. */
const HTTP = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  LOCKED: 423,
  SERVER_ERROR: 500,
} as const;

/**
 * Le back annonce le deverrouillage sous la forme `Account locked until <ISO>`.
 * On lit d'abord un eventuel champ dedie, puis on retombe sur l'extraction de
 * la date dans le texte. Si rien n'est exploitable, on renvoie null : l'appelant
 * affiche alors le message sans compte a rebours plutot qu'un decompte faux.
 */
function parseLockedUntil(data: unknown): Date | null {
  const payload = data as
    | (ApiErrorResponse & { messages?: { lockedUntil?: string } })
    | undefined;

  const candidates = [
    payload?.messages?.lockedUntil,
    payload?.messages?.message?.match(
      /\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})/,
    )?.[0],
  ];

  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

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
          // E-mail inconnu et mauvais mot de passe renvoient la meme erreur :
          // ne jamais distinguer les deux cas cote UI (enumeration de comptes).
          case HTTP.UNAUTHORIZED:
            throw new Error(AUTH.ERRORS.INVALID_CREDENTIALS);
          case HTTP.FORBIDDEN:
            throw new Error(AUTH.ERRORS.ACCOUNT_NOT_ACTIVE);
          case HTTP.LOCKED:
            throw new AuthLockedError(parseLockedUntil(err.response?.data));
          case HTTP.SERVER_ERROR:
            throw new Error(AUTH.ERRORS.SERVER);
        }
      }
      throw new Error(AUTH.ERRORS.SERVER);
    }
  },

  refresh: async (): Promise<void> => {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) throw new Error(AUTH.ERRORS.NO_REFRESH_TOKEN);

    try {
      // Rotation single-use cote back : l'ancien couple meurt des que celui-ci
      // repond. Ne jamais rejouer cet appel (cf. single-flight de l'intercepteur).
      const res = await api.post<RefreshTokenResponse>(AUTH_ROUTES.REFRESH, {
        refreshToken,
      });
      tokenService.setTokens(res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      // Tous les cas menent au login, mais on conserve le code : un refresh
      // deja consomme signale un vol de token possible, pas une simple
      // expiration, et merite d'etre distingue dans les logs.
      const code =
        err instanceof AxiosError
          ? (err.response?.data as ApiErrorResponse | undefined)?.messages?.code
          : undefined;

      if (code === API_ERROR_CODE.REFRESH_TOKEN_INVALID_OR_USED) {
        console.warn(
          '[auth] refresh token deja consomme — rejeu ou vol possible',
        );
      }

      throw new Error(AUTH.ERRORS.SERVER);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(AUTH_ROUTES.LOGOUT);
    } catch {
      // 401 SESSION_NOT_FOUND = deja deconnecte : c'est un succes.
      // Toute autre erreur ne doit pas empecher la purge locale non plus.
    } finally {
      tokenService.clearTokens();
      window.location.href = AUTH_ROUTES.LOGIN;
    }
  },
};
