import api from '@/config/axiosInstance';
import { PRICING_ROUTES } from '../constants/pricing.constants';
import type {
  PricingGrid,
  PricingGridListResponse,
} from '../types/pricingGrid';

export const pricingService = {
  /**
   * La grille qui chiffre aujourd'hui, `content` compris.
   *
   * Non enveloppee dans un `Error` nu : l'appelant doit reconnaitre
   * `404 PRICING_GRID_NO_ACTIVE` — un projet sans grille — d'une vraie panne.
   */
  getActive: async (): Promise<PricingGrid> =>
    (await api.get<PricingGrid>(PRICING_ROUTES.ACTIVE_GRID_API)).data,

  /** Les versions, tri decroissant impose par le serveur. Sans `content`. */
  getAll: async (params: { page?: number; limit?: number }) =>
    (
      await api.get<PricingGridListResponse>(PRICING_ROUTES.PRICING_GRIDS_API, {
        params,
      })
    ).data,

  /** Une version precise, `content` compris — archive ou brouillon. */
  getOne: async (id: string): Promise<PricingGrid> =>
    (await api.get<PricingGrid>(PRICING_ROUTES.GRID_API(id))).data,
};
