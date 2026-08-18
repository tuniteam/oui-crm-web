export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
};

export type CreateUserResponse = {
  id: string;
  email: string;
};
