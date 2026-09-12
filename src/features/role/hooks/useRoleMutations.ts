import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { ROLE_ERROR_CODES, ROLES_UI } from '../constants/roles.constants';
import { roleService } from '../services/role.service';
import type {
  DuplicateRolePayload,
  DuplicateRoleResponse,
  Role,
  UpdateRolePayload,
} from '../types/role';

const UI = ROLES_UI;

/** Ce que l'appelant fait du refus : le dire sous un champ, ou rien de plus. */
export type RoleFailure = 'CODE_EXISTS' | 'HANDLED';

/**
 * Ce que le serveur reproche, dit une seule fois pour les trois gestes.
 *
 * `ROLE_IS_SYSTEM`, `ROLE_NOT_FOUND` et `ROLE_IN_USE` ne devraient pas
 * survenir : l'écran masque déjà les actions sur un rôle système et refuse le
 * clic sur un rôle porté. S'ils arrivent, la liste affichée est périmée — on la
 * recharge plutôt que de laisser l'utilisateur cliquer dans le vide.
 *
 * Seul `ROLE_CODE_EXISTS` remonte à l'appelant : il se dit **sous le champ
 * Code**, là où on agit, et non dans un bandeau au coin de l'écran.
 */
function useRoleErrors() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['roles'] });

  const report = (err: unknown, fallback: string): RoleFailure => {
    const code = getApiErrorCode(err);
    if (code === ROLE_ERROR_CODES.CODE_EXISTS) return 'CODE_EXISTS';
    if (code === ROLE_ERROR_CODES.IN_USE) {
      toast.error(UI.ERRORS.IN_USE_ANY);
      refresh();
      return 'HANDLED';
    }
    if (code === ROLE_ERROR_CODES.IS_SYSTEM) {
      toast.error(UI.ERRORS.IS_SYSTEM);
      refresh();
      return 'HANDLED';
    }
    if (code === ROLE_ERROR_CODES.NOT_FOUND) {
      toast.error(UI.ERRORS.NOT_FOUND);
      refresh();
      return 'HANDLED';
    }
    toast.error(fallback);
    return 'HANDLED';
  };

  return { report, refresh };
}

/** Dupliquer : la seule façon de créer un rôle. */
export function useDuplicateRole() {
  const { report, refresh } = useRoleErrors();

  const mutation = useMutation<
    DuplicateRoleResponse,
    unknown,
    { id: string; payload: DuplicateRolePayload }
  >({
    mutationFn: ({ id, payload }) => roleService.duplicate(id, payload),
    onSuccess: (_created, { payload }) => {
      toast.success(UI.DUPLICATE_WINDOW.DONE(payload.label));
      refresh();
    },
  });

  const duplicate = async (
    id: string,
    payload: DuplicateRolePayload,
  ): Promise<DuplicateRoleResponse | RoleFailure> => {
    try {
      return await mutation.mutateAsync({ id, payload });
    } catch (err) {
      return report(err, UI.ERRORS.DUPLICATE);
    }
  };

  return { duplicate, pending: mutation.isPending };
}

/**
 * Enregistrer les droits d'un rôle.
 *
 * `permissions` **remplace tout l'ensemble** : l'écran envoie la matrice
 * entière, pas les seules cases changées. Un droit absent est un droit
 * retiré.
 */
export function useUpdateRole() {
  const { report, refresh } = useRoleErrors();

  const mutation = useMutation<Role, unknown, { id: string; payload: UpdateRolePayload }>({
    mutationFn: ({ id, payload }) => roleService.update(id, payload),
    onSuccess: () => refresh(),
  });

  const update = async (
    id: string,
    payload: UpdateRolePayload,
  ): Promise<Role | RoleFailure> => {
    try {
      return await mutation.mutateAsync({ id, payload });
    } catch (err) {
      return report(err, UI.ERRORS.SAVE);
    }
  };

  return { update, pending: mutation.isPending };
}

/** Supprimer : refusé tant que des utilisateurs portent le rôle. */
export function useDeleteRole() {
  const { report, refresh } = useRoleErrors();

  const mutation = useMutation<void, unknown, string>({
    mutationFn: roleService.remove,
    onSuccess: () => {
      toast.success(UI.DELETE_WINDOW.DONE);
      refresh();
    },
  });

  const remove = async (id: string): Promise<true | RoleFailure> => {
    try {
      await mutation.mutateAsync(id);
      return true;
    } catch (err) {
      return report(err, UI.ERRORS.SAVE);
    }
  };

  return { remove, pending: mutation.isPending };
}
