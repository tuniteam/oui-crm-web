import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { BOARD_ROUTES } from '../constants/board.constants';
import type {
  BoardResponse,
  SalesStatusPayload,
} from '../types/board';
import type { SalesStatus } from './../types/organizationList';

export const boardService = {
  /**
   * Sans `salesStatus`, les cinq colonnes rendent leur premiere page ; avec,
   * une seule colonne repond — c'est ainsi qu'on deroule une colonne sans
   * recharger les quatre autres.
   */
  getBoard: async (params?: {
    salesStatus?: SalesStatus;
    page?: number;
    limit?: number;
  }): Promise<BoardResponse> => {
    try {
      const res = await api.get<BoardResponse>(BOARD_ROUTES.BOARD_API, {
        params,
      });
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * Non enveloppee : l'appelant lit `ORGANIZATION_INVALID_TRANSITION` pour
   * distinguer un depot sur la colonne actuelle d'un vrai echec.
   */
  setSalesStatus: async (
    id: string,
    payload: SalesStatusPayload,
  ): Promise<{ id: string; salesStatus: SalesStatus }> => {
    const res = await api.post<{ id: string; salesStatus: SalesStatus }>(
      BOARD_ROUTES.SALES_STATUS_API(id),
      payload,
    );
    return res.data;
  },
};
