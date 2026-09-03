import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import {
  SCOPE_ERRORS,
  SCOPES_UI,
} from '../constants/scopes.constants';
import { scopesService } from '../services/scopes.service';
import type {
  CreateScopePayload,
  Scope,
  UpdateScopePayload,
} from '../types/scopes';

/** Ce qu'une ecriture peut produire. Un nom deja pris n'est pas un echec
 *  technique : c'est une correction a faire dans le champ. */
export type ScopeWriteOutcome =
  | { status: 'saved'; scope: Scope }
  | { status: 'name-taken' }
  | { status: 'error' };

export function useScopeMutations() {
  const queryClient = useQueryClient();
  const projectId = useMeStore((s) => s.activeProjectId);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['scopes', projectId] });
    // Un perimetre decide de ce que chaque utilisateur voit : la liste des
    // organismes peut changer sous ses pieds.
    queryClient.invalidateQueries({
      queryKey: ['organizations'],
      exact: false,
    });
  }, [queryClient, projectId]);

  const createMutation = useMutation<Scope, unknown, CreateScopePayload>({
    mutationFn: (payload) => scopesService.create(payload),
  });

  const updateMutation = useMutation<
    Scope,
    unknown,
    { id: string; payload: UpdateScopePayload }
  >({
    mutationFn: ({ id, payload }) => scopesService.update(id, payload),
  });

  const deleteMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => scopesService.remove(id),
  });

  const settle = useCallback(
    (err: unknown): ScopeWriteOutcome => {
      if (getApiErrorCode(err) === SCOPE_ERRORS.NAME_EXISTS) {
        return { status: 'name-taken' };
      }
      toast.error(getApiErrorMessage(err));
      return { status: 'error' };
    },
    [],
  );

  return {
    saving: createMutation.isPending || updateMutation.isPending,
    deleting: deleteMutation.isPending,

    create: async (payload: CreateScopePayload): Promise<ScopeWriteOutcome> => {
      try {
        const scope = await createMutation.mutateAsync(payload);
        toast.success(SCOPES_UI.TOASTS.CREATED);
        invalidate();
        return { status: 'saved', scope };
      } catch (err) {
        return settle(err);
      }
    },

    /** Refusee n'est pas echouee : un perimetre affecte se detache d'abord. */
    remove: async (id: string): Promise<'deleted' | 'in-use' | 'error'> => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(SCOPES_UI.TOASTS.DELETED);
        invalidate();
        return 'deleted';
      } catch (err) {
        if (getApiErrorCode(err) === SCOPE_ERRORS.IN_USE) return 'in-use';
        toast.error(getApiErrorMessage(err));
        return 'error';
      }
    },

    update: async (
      id: string,
      payload: UpdateScopePayload,
    ): Promise<ScopeWriteOutcome> => {
      try {
        const scope = await updateMutation.mutateAsync({ id, payload });
        toast.success(SCOPES_UI.TOASTS.UPDATED);
        invalidate();
        return { status: 'saved', scope };
      } catch (err) {
        return settle(err);
      }
    },
  };
}
