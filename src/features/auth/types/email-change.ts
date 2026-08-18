// features/auth/types/email-change.ts

export type EmailChangeRequestPayload = {
  newEmail: string;
  currentPassword: string;
};

export type EmailChangeRequestResponse = {
  success: boolean;
};

export type EmailChangeConfirmPayload = {
  token: string;
};

export type EmailChangeConfirmResponse = {
  success: boolean;
  email: string;
};