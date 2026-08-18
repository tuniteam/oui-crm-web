export type UploadAvatarResponse = {
  avatarUrl: string;
};

export type DraftAvatarFile = {
  file: File;
  previewUrl: string;
};

export type AvatarEditErrors = {
  type?: string;
  size?: string;
  save?: string;
};
