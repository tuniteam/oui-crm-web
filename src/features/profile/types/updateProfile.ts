export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  phone?: string | null;
};

export type UpdateProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};
