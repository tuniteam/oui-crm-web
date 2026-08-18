export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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
export type ApiErrorResponse = {
  statusCode?: number;
  messages?: {
    code?: string;
    message?: string;
  };
};