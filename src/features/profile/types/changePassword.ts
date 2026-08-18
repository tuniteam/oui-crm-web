export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
};