export type Role = {
  id: string;
  code: string;
  label: string;
  isBackoffice: boolean;
};

export type RoleListResponse = {
  data: Role[];
};

export type RoleListParams = {
  isBackoffice?: 'true' | 'false';
};
