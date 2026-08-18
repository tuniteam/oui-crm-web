import { getApiErrorMessage } from '@/shared/utils/api-error';
import api from '@/config/axiosInstance';
import { PROFILE_ROUTES } from '../constants/profile.constants';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../types/changePassword';
import type { MyProfileResponse } from '../types/profile';
import {
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../types/updateProfile';
import type { UploadAvatarResponse } from '../types/avatar';

export const profileService = {
  getMyProfile: async (): Promise<MyProfileResponse> => {
    try {
      const res = await api.get<{ data: MyProfileResponse }>(
        PROFILE_ROUTES.PROFILE_API,
      );
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<ChangePasswordResponse> => {
    try {
      const res = await api.patch<{ data: ChangePasswordResponse }>(
        PROFILE_ROUTES.PROFILE_PASSWORD_API,
        payload,
      );

      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfileResponse> => {
    try {
      const res = await api.patch<{ data: UpdateProfileResponse }>(
        PROFILE_ROUTES.PROFILE_API,
        payload,
      );

      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('declaredMimeType', file.type);
      formData.append('originalFileName', file.name);

      const res = await api.patch<{ data: UploadAvatarResponse }>(
        PROFILE_ROUTES.PROFILE_AVATAR_API,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  deleteAvatar: async (): Promise<void> => {
    try {
      await api.delete(PROFILE_ROUTES.PROFILE_AVATAR_API);
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
