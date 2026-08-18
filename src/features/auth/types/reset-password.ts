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

export type ApiErrorResponse = {
  statusCode?: number;
  messages?: {
    code?: string;
    message?: string;
  };
};