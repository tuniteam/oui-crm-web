// features/auth/services/token.service.ts

const ACCESS_TOKEN_KEY = 'soft_m_access_token';
const REFRESH_TOKEN_KEY = 'soft_m_refresh_token';

export const tokenService = {
  /**
   * Recupere l'access token du localStorage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Recupere le refresh token du localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Stocke les tokens dans le localStorage
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Supprime tous les tokens du localStorage
   */
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Verifie si un access token existe
   */
  hasAccessToken: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
