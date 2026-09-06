import api from '@/config/axiosInstance';
import { PRICING_ROUTES } from '../constants/pricing.constants';
import type { PricingGrid } from '../types/pricingGrid';

export const pricingService = {
  /**
   * La grille qui chiffre aujourd'hui, `content` compris.
   *
   * Non enveloppee dans un `Error` nu : l'appelant doit reconnaitre
   * `404 PRICING_GRID_NO_ACTIVE` — un projet sans grille — d'une vraie panne.
   */
  getActive: async (): Promise<PricingGrid> =>
    (await api.get<PricingGrid>(PRICING_ROUTES.ACTIVE_GRID_API)).data,
};
