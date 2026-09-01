import { getApiErrorMessage } from '@/shared/utils/api-error';
import api from '@/config/axiosInstance';
import { PROJECT_API_ROUTES } from '../constants/routes.constants';
import type {
  ProjectListParams,
  ProjectListResponse,
} from '../types/projectList';

export const projectService = {
  /**
   * GET /projects — route plateforme, reservee au back-office.
   * Elle ne prend PAS l'en-tete x-project-id : c'est justement elle qui sert
   * a choisir le projet a placer dans cet en-tete.
   */
  getAll: async (params: ProjectListParams): Promise<ProjectListResponse> => {
    try {
      const res = await api.get<ProjectListResponse>(
        PROJECT_API_ROUTES.PROJECTS,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
