import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import {
  ACTIVITIES_UI,
  ACTIVITY_ERRORS,
} from '../constants/activity.constants';
import { activityService } from '../services/activity.service';
import type {
  Activity,
  CompleteActivityPayload,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '../types/activity';

/**
 * Une action refusee parce qu'elle est close n'est pas un echec technique :
 * l'ecran a diverge de l'etat reel, et se recharge.
 */
export type ActivityWriteOutcome =
  | { status: 'saved'; activity: Activity }
  | { status: 'closed' }
  | { status: 'error' };

export function useActivityMutations() {
  const queryClient = useQueryClient();

  /**
   * Toute ecriture d'action touche trois choses.
   *
   * Les actions elles-memes ; la **fiche organisme**, dont le statut
   * commercial bascule (`MEETING_SCHEDULED` a la planification d'un
   * rendez-vous, `IN_PROGRESS` a la realisation) et dont `lastActivityAt` et
   * `nextActivityAt` sont recalcules ; et la **liste des organismes**, qui
   * affiche ces memes marques. Ne rafraichir que la frise laisserait la fiche
   * mentir.
   */
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['activities'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['organization'], exact: false });
    // Le compteur d'actions d'une campagne se calcule a la demande.
    queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
  }, [queryClient]);

  const createMutation = useMutation<Activity, unknown, CreateActivityPayload>({
    mutationFn: (payload) => activityService.create(payload),
  });

  const updateMutation = useMutation<
    Activity,
    unknown,
    { id: string; payload: UpdateActivityPayload }
  >({
    mutationFn: ({ id, payload }) => activityService.update(id, payload),
  });

  const completeMutation = useMutation<
    Activity,
    unknown,
    { id: string; payload: CompleteActivityPayload }
  >({
    mutationFn: ({ id, payload }) => activityService.complete(id, payload),
  });

  const cancelMutation = useMutation<Activity, unknown, string>({
    mutationFn: (id) => activityService.cancel(id),
  });

  const deleteMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => activityService.remove(id),
  });

  /*
   * `409 ACTIVITY_ALREADY_CLOSED` signale une divergence : l'ecran n'offre ces
   * gestes que sur une action `PLANNED`, donc le refus veut dire qu'elle a
   * bouge ailleurs. On recharge plutot que de laisser l'ecran mentir.
   */
  const settle = useCallback(
    (err: unknown): ActivityWriteOutcome => {
      if (getApiErrorCode(err) === ACTIVITY_ERRORS.ALREADY_CLOSED) {
        toast.error(ACTIVITIES_UI.ERRORS.CLOSED);
        invalidate();
        return { status: 'closed' };
      }
      toast.error(getApiErrorMessage(err));
      return { status: 'error' };
    },
    [invalidate],
  );

  const run = useCallback(
    async (
      call: () => Promise<Activity>,
      message: string,
    ): Promise<ActivityWriteOutcome> => {
      try {
        const activity = await call();
        toast.success(message);
        invalidate();
        return { status: 'saved', activity };
      } catch (err) {
        return settle(err);
      }
    },
    [invalidate, settle],
  );

  return {
    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      completeMutation.isPending,
    busy: cancelMutation.isPending || deleteMutation.isPending,

    create: (payload: CreateActivityPayload) =>
      run(
        () => createMutation.mutateAsync(payload),
        ACTIVITIES_UI.TOASTS.CREATED,
      ),

    update: (id: string, payload: UpdateActivityPayload) =>
      run(
        () => updateMutation.mutateAsync({ id, payload }),
        ACTIVITIES_UI.TOASTS.UPDATED,
      ),

    complete: (id: string, payload: CompleteActivityPayload) =>
      run(
        () => completeMutation.mutateAsync({ id, payload }),
        ACTIVITIES_UI.TOASTS.COMPLETED,
      ),

    cancel: (id: string) =>
      run(
        () => cancelMutation.mutateAsync(id),
        ACTIVITIES_UI.TOASTS.CANCELLED,
      ),

    /** Aucun garde-fou cote serveur : elle supprime quel que soit le statut. */
    remove: async (id: string): Promise<'deleted' | 'error'> => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(ACTIVITIES_UI.TOASTS.DELETED);
        invalidate();
        return 'deleted';
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        return 'error';
      }
    },
  };
}
