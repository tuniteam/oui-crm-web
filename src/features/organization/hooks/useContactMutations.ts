import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import {
  CONTACT_ERRORS,
  CONTACT_ERROR_MESSAGES,
  CONTACT_TOASTS,
} from '../constants/contact.constants';
import { contactService } from '../services/contact.service';
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';

/** Résultat d'une suppression : refusée n'est pas échouée. */
export type DeleteOutcome = 'deleted' | 'has-activities' | 'error';

/**
 * Écritures sur les contacts — US-01-04.
 *
 * Toutes invalident **la liste des contacts et la fiche** : chaque écriture
 * recalcule la complétude de l'organisme (critère `PRIMARY_CONTACT`, un
 * sixième du score) et peut rétrograder l'ancien contact principal. Ne
 * rafraîchir que la ligne touchée laisserait le bandeau de complétude et
 * l'ancien principal mentir.
 */
export function useContactMutations(organizationId: string) {
  const queryClient = useQueryClient();
  const projectId = useMeStore((s) => s.activeProjectId);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['organizations', 'contacts', projectId, organizationId],
    });
    queryClient.invalidateQueries({
      queryKey: ['organizations', 'detail', projectId, organizationId],
    });
    // La liste porte le score de complétude en colonne.
    queryClient.invalidateQueries({
      queryKey: ['organizations', 'list'],
      exact: false,
    });
  }, [queryClient, projectId, organizationId]);

  /**
   * Message d'un échec d'écriture.
   *
   * Deux `404` du contrat méritent mieux que le message générique du serveur :
   * la fiche disparue depuis l'ouverture, et le contact supprimé ailleurs. On
   * les nomme, et on ne ferme rien — la saisie reste sous les yeux.
   */
  const messageFor = useCallback((err: unknown) => {
    const code = getApiErrorCode(err);
    if (code === CONTACT_ERRORS.ORGANIZATION_NOT_FOUND) {
      return CONTACT_ERROR_MESSAGES.ORGANIZATION_NOT_FOUND;
    }
    if (code === CONTACT_ERRORS.NOT_FOUND) {
      // Le contact n'existe plus : la liste doit repartir du serveur.
      invalidate();
      return CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND;
    }
    return getApiErrorMessage(err);
  }, [invalidate]);

  const createMutation = useMutation<Contact, unknown, CreateContactPayload>({
    mutationFn: (payload) => contactService.create(organizationId, payload),
  });

  const updateMutation = useMutation<
    Contact,
    unknown,
    { id: string; payload: UpdateContactPayload }
  >({
    mutationFn: ({ id, payload }) => contactService.update(id, payload),
  });

  const deleteMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => contactService.remove(id),
  });

  return {
    saving: createMutation.isPending || updateMutation.isPending,
    deleting: deleteMutation.isPending,

    create: async (payload: CreateContactPayload) => {
      try {
        await createMutation.mutateAsync(payload);
        toast.success(CONTACT_TOASTS.CREATED);
        invalidate();
        return true;
      } catch (e) {
        toast.error(messageFor(e));
        return false;
      }
    },

    update: async (id: string, payload: UpdateContactPayload) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        toast.success(CONTACT_TOASTS.UPDATED);
        invalidate();
        return true;
      } catch (e) {
        toast.error(messageFor(e));
        return false;
      }
    },

    /** Marque un contact « ne pas démarcher » : la sortie proposée quand la
     *  suppression est refusée parce que des actions le référencent. */
    optOut: async (id: string) => {
      try {
        await updateMutation.mutateAsync({ id, payload: { optOut: true } });
        toast.success(CONTACT_TOASTS.OPTED_OUT);
        invalidate();
        return true;
      } catch (e) {
        toast.error(messageFor(e));
        return false;
      }
    },

    remove: async (id: string): Promise<DeleteOutcome> => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(CONTACT_TOASTS.DELETED);
        invalidate();
        return 'deleted';
      } catch (err) {
        // Refus documenté : l'historique garde ses acteurs. L'écran propose
        // « ne pas démarcher » plutôt qu'un message sans suite.
        if (getApiErrorCode(err) === CONTACT_ERRORS.HAS_ACTIVITIES) {
          return 'has-activities';
        }
        toast.error(messageFor(err));
        return 'error';
      }
    },
  };
}
