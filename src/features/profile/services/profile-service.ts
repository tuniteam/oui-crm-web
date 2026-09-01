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
      // GET /profile n'existe pas : le profil se lit sur /profile/me, a plat.
      const res = await api.get<MyProfileResponse>(PROFILE_ROUTES.PROFILE_ME_API);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<ChangePasswordResponse> => {
    try {
      const res = await api.patch<ChangePasswordResponse>(
        PROFILE_ROUTES.PROFILE_PASSWORD_API,
        payload,
      );

      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfileResponse> => {
    try {
      const res = await api.patch<UpdateProfileResponse>(
        PROFILE_ROUTES.PROFILE_API,
        payload,
      );

      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    try {
      const formData = new FormData();
      // Le contrat n'attend que `file` : le type MIME et le nom d'origine sont
      // lus sur la piece jointe elle-meme, les renvoyer a plat n'ajoute rien.
      formData.append('file', file);

      const res = await api.patch<UploadAvatarResponse>(
        PROFILE_ROUTES.PROFILE_AVATAR_API,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      return res.data;
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
