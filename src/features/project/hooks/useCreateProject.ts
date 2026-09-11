import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { CREATE_PROJECT_UI, PROJECT_ERROR_CODES } from '../constants/constants';
import { projectService } from '../services/projectService';
import type {
  CreateProjectPayload,
  CreateProjectResponse,
} from '../types/projectCreate';

/** Le champ auquel une erreur du serveur se rattache, quand elle en a un. */
export type CreateProjectFieldError = {
  field: 'slug' | 'copyFromProjectId';
  message: string;
};

/**
 * Créer un projet — `POST /projects`.
 *
 * Deux refus se posent **devant leur champ**, pas dans un toast : un
 * identifiant déjà pris se corrige sous l'identifiant, un projet source
 * disparu sous la liste des sources. Un toast les disait sans dire où agir.
 * Le reste — `400` inattendu, panne — reste en toast.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateProjectResponse, unknown, CreateProjectPayload>({
    mutationFn: projectService.create,
    onSuccess: (_created, payload) => {
      toast.success(CREATE_PROJECT_UI.CREATED(payload.name));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  /**
   * Rend le projet créé, ou l'erreur rattachée à son champ.
   *
   * On ne rejette jamais : chaque appelant devrait sinon envelopper son
   * `await` dans un try/catch, et un oubli deviendrait un rejet non capturé.
   */
  const create = async (
    payload: CreateProjectPayload,
  ): Promise<
    | { ok: true; created: CreateProjectResponse }
    | { ok: false; fieldError: CreateProjectFieldError | null }
  > => {
    try {
      return { ok: true, created: await mutation.mutateAsync(payload) };
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === PROJECT_ERROR_CODES.SLUG_EXISTS) {
        return {
          ok: false,
          fieldError: { field: 'slug', message: CREATE_PROJECT_UI.ERRORS.SLUG_EXISTS },
        };
      }
      if (code === PROJECT_ERROR_CODES.NOT_FOUND) {
        return {
          ok: false,
          fieldError: {
            field: 'copyFromProjectId',
            message: CREATE_PROJECT_UI.ERRORS.SOURCE_NOT_FOUND,
          },
        };
      }
      /* `401` et `403` sont déjà traités par l'intercepteur ; un `400` qui
         passerait le schéma, ou une panne, se dit ici. */
      toast.error(CREATE_PROJECT_UI.ERRORS.CREATE);
      return { ok: false, fieldError: null };
    }
  };

  return { create, loading: mutation.isPending };
}
