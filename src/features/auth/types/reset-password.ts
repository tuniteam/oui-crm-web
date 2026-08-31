import type { ApiErrorEnvelope } from '@/shared/utils/api-error';
export type PasswordResetRequestPayload = {
  email: string;
};

export type PasswordResetRequestResponse = {
  success: boolean;
  message: string;
};

export type PasswordResetValidateResponse = {
  valid: boolean;
};

export type PasswordResetCompletePayload = {
  token: string;
  password: string;
};

export type PasswordResetCompleteResponse = {
  id: string;
  email: string;
  status: string;
};

/** @deprecated Alias de compatibilite — importer ApiErrorEnvelope directement. */
export type ApiErrorResponse = ApiErrorEnvelope;