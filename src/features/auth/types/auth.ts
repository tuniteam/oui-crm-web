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

/** Document legal a presenter avant les cases : la liste vient du serveur. */
export type LegalDocument = {
  code: string;
  version: number;
  url: string;
};

export type ActivationValidateResponse = {
  email: string;
  firstName: string;
  lastName: string;
  legalDocuments: LegalDocument[];
};

export type ActivationCompletePayload = {
  token: string;
  password: string;
  acceptCgu: boolean;
  acceptRgpd: boolean;
};

/**
 * L'activation ouvre la session : le serveur rend le meme couple de jetons
 * qu'un login. Aucun re-login a faire ensuite.
 */
export type ActivationCompleteResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
/** @deprecated Alias de compatibilite — importer ApiErrorEnvelope directement. */
export type ApiErrorResponse = ApiErrorEnvelope;