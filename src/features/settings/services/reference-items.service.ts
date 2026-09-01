import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { SETTINGS_API } from '../constants/routes.constants';
import type {
  CreateReferenceItemPayload,
  ReferenceItem,
  ReferenceItemsResponse,
  UpdateReferenceItemPayload,
} from '../types/reference-items';

export const referenceItemsService = {
  /**
   * Sans `category`, l'API renvoie tout le projet en un appel, trié par
   * catégorie puis ordre puis libellé. C'est le mode prévu par le contrat :
   * charger une fois au choix du projet et garder en cache, toutes les listes
   * déroulantes en dépendent.
   */
  getAll: async (): Promise<ReferenceItemsResponse> => {
    try {
      const res = await api.get<ReferenceItemsResponse>(
        SETTINGS_API.REFERENCE_ITEMS,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  create: async (
    payload: CreateReferenceItemPayload,
  ): Promise<{ id: string; key: string }> => {
    try {
      const res = await api.post<{ id: string; key: string }>(
        SETTINGS_API.REFERENCE_ITEMS,
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /** `category` et `key` sont refusés : la clé identifie la valeur à vie. */
  update: async (
    id: string,
    payload: UpdateReferenceItemPayload,
  ): Promise<ReferenceItem> => {
    try {
      const res = await api.patch<ReferenceItem>(
        SETTINGS_API.REFERENCE_ITEM(id),
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
