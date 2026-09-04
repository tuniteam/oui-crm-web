import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { AGENDA_ROUTES } from '../constants/agenda.constants';
import { AGENDA_MAX_LIMIT, type AgendaParams, type AgendaResponse } from '../types/agenda';

export const agendaService = {
  /** Une page de la periode. La pagination est orchestree par le hook. */
  getPage: async (params: AgendaParams): Promise<AgendaResponse> => {
    try {
      const res = await api.get<AgendaResponse>(AGENDA_ROUTES.AGENDA_API, {
        params: { limit: AGENDA_MAX_LIMIT, ...params },
      });
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
