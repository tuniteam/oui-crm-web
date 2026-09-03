import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { SCOPE_ROUTES } from '../constants/scopes.constants';
import type {
  CreateScopePayload,
  GeoRegionsResponse,
  Scope,
  ScopesResponse,
  UpdateScopePayload,
} from '../types/scopes';

export const scopesService = {
  getAll: async (): Promise<ScopesResponse> => {
    try {
      const res = await api.get<ScopesResponse>(SCOPE_ROUTES.SCOPES_API);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /** Table statique de 14 regions. */
  getRegions: async (): Promise<GeoRegionsResponse> => {
    try {
      const res = await api.get<GeoRegionsResponse>(
        SCOPE_ROUTES.GEO_REGIONS_API,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  create: async (payload: CreateScopePayload): Promise<Scope> => {
    const res = await api.post<Scope>(SCOPE_ROUTES.SCOPES_API, payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateScopePayload): Promise<Scope> => {
    const res = await api.patch<Scope>(SCOPE_ROUTES.SCOPE_API(id), payload);
    return res.data;
  },

  /**
   * Volontairement non enveloppe : l'appelant doit lire `SCOPE_IN_USE` pour
   * expliquer le refus. Un `Error` nu perdrait le code.
   */
  remove: async (id: string): Promise<void> => {
    await api.delete(SCOPE_ROUTES.SCOPE_API(id));
  },
};
