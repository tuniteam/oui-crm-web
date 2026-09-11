import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMeta } from '@/shared/utils/api-error';
import { useMeStore } from '@/contexts/useMeStore';
import {
  PROJECT_DANGER_UI,
  PROJECT_NOT_FOUND,
  PROJECT_STATUS_ERROR_CODES,
} from '../constants/constants';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import { projectService } from '../services/projectService';

/** Les données qui retiennent un projet, telles que `messages.meta` les donne. */
export type ProjectDataCounts = Record<string, number>;

/**
 * Supprimer un projet — `DELETE /projects/:id`.
 *
 * Seul un projet **sans donnée métier** part. Sinon, `409 PROJECT_NOT_EMPTY`
 * rend ses compteurs dans `messages.meta`, et l'écran propose l'archivage à
 * la place : on ne laisse pas l'utilisateur devant un refus sans issue.
 */
export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const UI = PROJECT_DANGER_UI.DELETE;

  const leave = () => {
    /* Le projet pouvait être le projet courant : l'en-tête `x-project-id`
       partirait vers un projet qui n'existe plus. */
    const store = useMeStore.getState();
    if (store.getActiveProjectId() === projectId) store.setActiveProjectId(null);
    queryClient.removeQueries({ queryKey: ['projects', 'detail', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    navigate(PROJECT_ROUTES.PROJECTS);
  };

  const mutation = useMutation<void, unknown, string>({
    mutationFn: (name) => projectService.remove(projectId, name),
    onSuccess: () => {
      toast.success(UI.DONE);
      leave();
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      /* Traités par l'écran : le nom sous son champ, le contenu avec ses
         compteurs et la proposition d'archiver. */
      if (
        code === PROJECT_STATUS_ERROR_CODES.NAME_MISMATCH ||
        code === PROJECT_STATUS_ERROR_CODES.NOT_EMPTY
      )
        return;
      if (code === PROJECT_STATUS_ERROR_CODES.NOT_FOUND) {
        /* Déjà supprimé dans un autre onglet : l'issue voulue, atteinte
           ailleurs. */
        toast.error(PROJECT_NOT_FOUND.DESCRIPTION);
        leave();
        return;
      }
      toast.error(UI.FAILED);
    },
  });

  const remove = async (
    name: string,
  ): Promise<
    | { result: 'OK' | 'NAME_MISMATCH' | 'DONE_ELSEWHERE' }
    | { result: 'NOT_EMPTY'; counts: ProjectDataCounts }
  > => {
    try {
      await mutation.mutateAsync(name);
      return { result: 'OK' };
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === PROJECT_STATUS_ERROR_CODES.NAME_MISMATCH) return { result: 'NAME_MISMATCH' };
      if (code === PROJECT_STATUS_ERROR_CODES.NOT_EMPTY) {
        const meta = getApiErrorMeta(err) ?? {};
        const counts = Object.fromEntries(
          Object.entries(meta).filter(([, v]) => typeof v === 'number' && v > 0),
        ) as ProjectDataCounts;
        return { result: 'NOT_EMPTY', counts };
      }
      return { result: 'DONE_ELSEWHERE' };
    }
  };

  return { remove, pending: mutation.isPending };
}
