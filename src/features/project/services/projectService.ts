import { getApiErrorMessage } from '@/shared/utils/api-error';
import api from '@/config/axiosInstance';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import type {
  ProjectListParams,
  ProjectListResponse,
} from '../types/projectList';
import type { ProjectDetailsResponse } from '../types/projectDetails';
import type { ProjectStatus } from '../types/project';
import type {
  CreateProjectPayload,
  CreateProjectResponse,
} from '../types/projectCreate';

export const projectService = {
  /**
   * GET /projects — route plateforme, reservee au back-office.
   * Elle ne prend PAS l'en-tete x-project-id : c'est justement elle qui sert
   * a choisir le projet a placer dans cet en-tete.
   */
  getAll: async (params: ProjectListParams): Promise<ProjectListResponse> => {
    try {
      const res = await api.get<ProjectListResponse>(
        PROJECT_ROUTES.PROJECTS_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  getOne: async (projectId: string): Promise<ProjectDetailsResponse> => {
    try {
      const res = await api.get<ProjectDetailsResponse>(
        PROJECT_ROUTES.PROJECT_API(projectId),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /**
   * POST /projects — route plateforme, **sans** `x-project-id` : le projet
   * n'existe pas encore.
   *
   * Non enveloppée dans un `Error` nu, contrairement aux lectures : l'écran
   * doit reconnaître `409 PROJECT_SLUG_EXISTS` pour le poser sous le champ
   * Identifiant, et `404 PROJECT_NOT_FOUND` sous le projet à copier. Un
   * message aplati les rendrait indiscernables d'une panne.
   */
  create: async (payload: CreateProjectPayload): Promise<CreateProjectResponse> =>
    (await api.post<CreateProjectResponse>(PROJECT_ROUTES.PROJECTS_API, payload))
      .data,

  /**
   * POST /projects/:id/status — `204`, corps vide. Route plateforme, **sans**
   * `x-project-id`.
   *
   * Non enveloppée dans un `Error` nu : l'écran distingue `409` (le projet a
   * changé de statut entre-temps, on recharge la fiche) de `404` (il a
   * disparu, on revient à la liste).
   */
  changeStatus: async (
    id: string,
    status: ProjectStatus,
    /** Exigé pour archiver seulement : le nom exact, en confirmation. */
    name?: string,
  ): Promise<void> => {
    await api.post(PROJECT_ROUTES.PROJECT_STATUS_API(id), { status, name });
  },

  /**
   * DELETE /projects/:id — `204`. Un DELETE **avec corps** : le nom exact,
   * en confirmation. Axios le passe dans `data`.
   *
   * Non enveloppée : `409 PROJECT_NOT_EMPTY` porte ses compteurs dans
   * `messages.meta`, et l'écran en a besoin pour proposer l'archivage.
   */
  remove: async (id: string, name: string): Promise<void> => {
    await api.delete(PROJECT_ROUTES.PROJECT_API(id), { data: { name } });
  },
};
