import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorCode } from '@/shared/utils/api-error';
import {
  ACTIVATE_PROJECT_UI,
  PROJECT_NOT_FOUND,
  PROJECT_STATUS,
  PROJECT_STATUS_ERROR_CODES,
} from '../constants/constants';
import { PROJECT_ROUTES } from '../constants/routes.constants';
import { projectService } from '../services/projectService';

/**
 * Activer un projet — `DRAFT → ACTIVE`.
 *
 * Trois issues, et aucune ne laisse l'écran mentir :
 *
 * - **réussite** : la fiche se recharge, et affiche `ACTIVE` et la date
 *   d'activation que le serveur vient de poser ;
 * - **`409`** : le projet n'était plus en brouillon — activé dans un autre
 *   onglet. On le dit, et on recharge : le bouton disparaît de lui-même ;
 * - **`404`** : le projet n'existe plus. Rester sur sa fiche n'aurait aucun
 *   sens, on revient à la liste.
 */
export function useActivateProject(projectId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /* La liste porte aussi le statut : elle doit suivre la fiche. */
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['projects'] });

  const mutation = useMutation<void, unknown, void>({
    mutationFn: () => projectService.changeStatus(projectId, PROJECT_STATUS.ACTIVE),
    onSuccess: () => {
      toast.success(ACTIVATE_PROJECT_UI.DONE);
      refresh();
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === PROJECT_STATUS_ERROR_CODES.INVALID_TRANSITION) {
        toast.error(ACTIVATE_PROJECT_UI.ALREADY_CHANGED);
        refresh();
        return;
      }
      if (code === PROJECT_STATUS_ERROR_CODES.NOT_FOUND) {
        toast.error(PROJECT_NOT_FOUND.DESCRIPTION);
        navigate(PROJECT_ROUTES.PROJECTS);
        return;
      }
      /* `401` et `403` passent par l'intercepteur ; le reste se dit ici. */
      toast.error(ACTIVATE_PROJECT_UI.FAILED);
    },
  });

  /**
   * Rend `true` si le projet est activé. Ne rejette jamais : chaque issue est
   * déjà traitée ci-dessus, et l'appelant n'a qu'à fermer sa fenêtre.
   */
  const activate = async (): Promise<boolean> => {
    try {
      await mutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  };

  return { activate, activating: mutation.isPending };
}
