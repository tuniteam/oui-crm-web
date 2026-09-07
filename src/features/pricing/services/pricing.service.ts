import api from '@/config/axiosInstance';
import { PRICING_ROUTES } from '../constants/pricing.constants';
import type {
  PricingGrid,
  PricingGridContent,
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

  /**
   * Prepare une version, **inactive**. Non enveloppee : l'appelant a besoin de
   * `details[]` pour dire ou la grille est refusee.
   */
  create: async (payload: {
    fromVersion: number;
    content: PricingGridContent;
    effectiveDate: string;
  }): Promise<{ id: string; version: number }> =>
    (
      await api.post<{ id: string; version: number }>(
        PRICING_ROUTES.PRICING_GRIDS_API,
        payload,
      )
    ).data,

  /**
   * Corrige une version **sans en creer une nouvelle** — SPEC-18.
   *
   * Les deux champs sont independants : on peut ne changer que la date. Le
   * numero, la filiation, l'auteur et la date de creation ne bougent jamais.
   */
  update: async (
    id: string,
    payload: { content?: PricingGridContent; effectiveDate?: string },
  ): Promise<PricingGrid> =>
    (await api.patch<PricingGrid>(PRICING_ROUTES.GRID_API(id), payload)).data,

  /** Renonce a une version. `204`. */
  remove: async (id: string): Promise<void> => {
    await api.delete(PRICING_ROUTES.GRID_API(id));
  },
};
