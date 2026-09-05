import api from '@/config/axiosInstance';
import { BULK_ROUTES } from '../constants/bulk.constants';
import type { BulkRequest, BulkResult } from '../types/bulk';

export const bulkService = {
  /**
   * Non enveloppee dans un `Error` nu : l'appelant a besoin du code brut pour
   * distinguer un droit manquant (`403`) d'un commercial inconnu (`404`).
   */
  run: async (request: BulkRequest): Promise<BulkResult> => {
    const res = await api.post<BulkResult>(BULK_ROUTES.BULK_API, request);
    return res.data;
  },
};
