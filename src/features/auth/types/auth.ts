import type { ApiErrorEnvelope } from '@/shared/utils/api-error';
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  /** Duree de vie de l'access token, en secondes. */
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number
}

export type ActivationValidateResponse = {
  valid: boolean;
};

export type ActivationCompletePayload = {
  token: string;
  password: string;
};

export type ActivationCompleteResponse = {
  id: string;
  email: string;
  status: string;
};
/** @deprecated Alias de compatibilite — importer ApiErrorEnvelope directement. */
export type ApiErrorResponse = ApiErrorEnvelope;