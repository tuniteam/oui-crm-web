import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { ACTIVITY_ROUTES } from '../constants/activity.constants';
import type {
  Activity,
  ActivityListParams,
  ActivityListResponse,
  CompleteActivityPayload,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '../types/activity';

/**
 * Les ecritures ne sont **pas** enveloppees dans un `Error` nu : l'appelant a
 * besoin du code brut pour distinguer ce que le contrat distingue — une action
 * deja close, un type inconnu du referentiel.
 */
export const activityService = {
  getAll: async (params: ActivityListParams): Promise<ActivityListResponse> => {
    try {
      const res = await api.get<ActivityListResponse>(
        ACTIVITY_ROUTES.ACTIVITIES_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  create: async (payload: CreateActivityPayload): Promise<Activity> => {
    const res = await api.post<Activity>(
      ACTIVITY_ROUTES.ACTIVITIES_API,
      payload,
    );
    return res.data;
  },

  update: async (
    id: string,
    payload: UpdateActivityPayload,
  ): Promise<Activity> => {
    const res = await api.patch<Activity>(
      ACTIVITY_ROUTES.ACTIVITY_API(id),
      payload,
    );
    return res.data;
  },

  /** Le compte rendu est obligatoire : c'est lui qui rend l'action reelle. */
  complete: async (
    id: string,
    payload: CompleteActivityPayload,
  ): Promise<Activity> => {
    const res = await api.post<Activity>(
      ACTIVITY_ROUTES.ACTIVITY_COMPLETE_API(id),
      payload,
    );
    return res.data;
  },

  cancel: async (id: string): Promise<Activity> => {
    const res = await api.post<Activity>(
      ACTIVITY_ROUTES.ACTIVITY_CANCEL_API(id),
      {},
    );
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(ACTIVITY_ROUTES.ACTIVITY_API(id));
  },
};
