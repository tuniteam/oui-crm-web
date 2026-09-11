import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorCode } from '@/shared/utils/api-error';
import {
  PROJECT_NOT_FOUND,
  PROJECT_STATUS_CHANGED,
  PROJECT_ERROR_CODES,
} from '../constants/constants';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import { projectService } from '../services/projectService';
import type { ProjectStatus } from '../types/project';

/** Ce que chaque geste dit en cas de réussite ou de panne. */
export type StatusChangeMessages = { done: string; failed: string };

/**
 * Changer le statut d'un projet — activer, archiver, restaurer.
 *
 * Une seule route, `POST /projects/:id/status`, et les mêmes issues pour les
 * trois gestes : un hook, pas trois copies qui divergeraient.
 *
 * - **réussite** : la fiche et la liste se rechargent — la liste porte aussi
 *   le statut ;
 * - **`409 INVALID_STATUS_TRANSITION`** : le projet a changé ailleurs entre
 *   l'affichage et le clic. On le dit et on recharge : le bon bouton
 *   apparaît de lui-même ;
 * - **`404`** : le projet n'existe plus, on revient à la liste ;
 * - **`400 PROJECT_NAME_MISMATCH`** (archivage) : rendu à l'appelant, qui le
 *   pose sous le champ du nom plutôt que dans un toast.
 */
export function useChangeProjectStatus(projectId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  const mutation = useMutation<
    void,
    unknown,
    { status: ProjectStatus; name?: string; messages: StatusChangeMessages }
  >({
    mutationFn: ({ status, name }) =>
      projectService.changeStatus(projectId, status, name),
    onSuccess: (_d, { messages }) => {
      toast.success(messages.done);
      refresh();
    },
    onError: (err, { messages }) => {
      const code = getApiErrorCode(err);
      if (code === PROJECT_ERROR_CODES.NAME_MISMATCH) return;
      if (code === PROJECT_ERROR_CODES.INVALID_TRANSITION) {
        toast.error(PROJECT_STATUS_CHANGED);
        refresh();
        return;
      }
      if (code === PROJECT_ERROR_CODES.NOT_FOUND) {
        toast.error(PROJECT_NOT_FOUND.DESCRIPTION);
        navigate(PROJECT_ROUTES.PROJECTS);
        return;
      }
      /* `401` et `403` passent par l'intercepteur ; le reste se dit ici. */
      toast.error(messages.failed);
    },
  });

  /**
   * `'OK'`, `'NAME_MISMATCH'` pour que l'appelant l'affiche sous le champ, ou
   * `'HANDLED'` pour toute autre issue, déjà traitée ci-dessus. Ne
   * rejette jamais.
   */
  const changeStatus = async (
    status: ProjectStatus,
    messages: StatusChangeMessages,
    name?: string,
  ): Promise<'OK' | 'NAME_MISMATCH' | 'HANDLED'> => {
    try {
      await mutation.mutateAsync({ status, name, messages });
      return 'OK';
    } catch (err) {
      return getApiErrorCode(err) === PROJECT_ERROR_CODES.NAME_MISMATCH
        ? 'NAME_MISMATCH'
        : 'HANDLED';
    }
  };

  return { changeStatus, pending: mutation.isPending };
}
