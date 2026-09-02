import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { ORGANIZATION_ROUTES } from '../constants/organization.routes';
import type {
  OrganizationListParams,
  OrganizationListResponse,
} from '../types/organizationList';
import type {
  OrganizationDetail,
  UpdateOrganizationPayload,
} from '../types/organizationDetail';
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  RegistrySearchResponse,
} from '../types/organizationCreate';

export const organizationService = {
  getAll: async (
    params: OrganizationListParams,
  ): Promise<OrganizationListResponse> => {
    try {
      const res = await api.get<OrganizationListResponse>(
        ORGANIZATION_ROUTES.ORGANIZATIONS_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  getOne: async (id: string): Promise<OrganizationDetail> => {
    try {
      const res = await api.get<OrganizationDetail>(
        ORGANIZATION_ROUTES.ORGANIZATION_API(id),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * Volontairement non enveloppe par `getApiErrorMessage` : l'appelant a
   * besoin du code brut et de `messages.meta.duplicates` pour proposer les
   * fiches existantes puis rejouer avec `force`.
   */
  create: async (
    payload: CreateOrganizationPayload,
  ): Promise<CreateOrganizationResponse> => {
    const res = await api.post<CreateOrganizationResponse>(
      ORGANIZATION_ROUTES.ORGANIZATIONS_API,
      payload,
    );
    return res.data;
  },

  /** Idem : un 503 ou un 504 du registre n'est pas une erreur a afficher,
   *  c'est le signal de basculer en saisie manuelle. */
  searchRegistry: async (q: string): Promise<RegistrySearchResponse> => {
    const res = await api.get<RegistrySearchResponse>(
      ORGANIZATION_ROUTES.SEARCH_REGISTRY_API,
      // `503` et `504` sont documentes comme nominaux : ils font basculer en
      // saisie manuelle, ils n'emmenent pas l'application sur l'ecran d'erreur.
      { params: { q }, expectedServerError: true },
    );
    return res.data;
  },

  /** Suppression logique : la fiche disparait des lectures, la ligne demeure. */
  remove: async (id: string): Promise<void> => {
    try {
      await api.delete(ORGANIZATION_ROUTES.ORGANIZATION_API(id));
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  update: async (
    id: string,
    payload: UpdateOrganizationPayload,
  ): Promise<OrganizationDetail> => {
    try {
      const res = await api.patch<OrganizationDetail>(
        ORGANIZATION_ROUTES.ORGANIZATION_API(id),
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
