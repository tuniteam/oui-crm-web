import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { SETTINGS_API } from '../constants/routes.constants';
import type {
  SettingsResponse,
  UpdateSettingsPayload,
} from '../types/settings';

export const settingsService = {
  get: async (): Promise<SettingsResponse> => {
    try {
      const res = await api.get<SettingsResponse>(SETTINGS_API.SETTINGS);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * PATCH partiel : `company` et `stageProbabilities` fusionnent cle par cle
   * cote serveur. On n'envoie donc que ce qui a change — envoyer l'objet
   * complet fonctionnerait, mais ecraserait un champ modifie entre-temps.
   */
  update: async (payload: UpdateSettingsPayload): Promise<SettingsResponse> => {
    try {
      const res = await api.patch<SettingsResponse>(
        SETTINGS_API.SETTINGS,
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
