import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import type { ApiErrorEnvelope } from '@/shared/utils/api-error';
import type { AxiosError } from 'axios';
import {
  CREATE_ORGANIZATION_ERRORS,
} from '../constants/organizationCreate.constants';
import { organizationService } from '../services/organization.service';
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  DuplicateCandidate,
} from '../types/organizationCreate';

/**
 * Ce que la creation a produit : la fiche, ou la raison de son refus.
 *
 * Un doublon probable n'est pas un echec : c'est une question posee a
 * l'utilisateur, a qui l'on montre les fiches existantes avant de rejouer la
 * meme requete avec `force`. On le distingue donc des vraies erreurs plutot
 * que de le noyer dans un message.
 */
export type CreateOutcome =
  | { status: 'created'; organization: CreateOrganizationResponse }
  | { status: 'duplicate'; candidates: DuplicateCandidate[] }
  | { status: 'field-error'; code: string }
  | { status: 'error'; message: string };

/** `messages.meta.duplicates`, deja type par l'enveloppe d'erreur du projet. */
function duplicatesOf(err: unknown): DuplicateCandidate[] {
  const ax = err as AxiosError<ApiErrorEnvelope>;
  return ax.response?.data?.messages?.meta?.duplicates ?? [];
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CreateOrganizationResponse,
    unknown,
    CreateOrganizationPayload
  >({
    mutationFn: (payload) => organizationService.create(payload),
    onSuccess: () => {
      // La reponse ne porte que trois champs : elle ne peut pas alimenter le
      // cache de la liste, qui en attend une vingtaine. On invalide.
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'list'],
        exact: false,
      });
    },
  });

  return {
    loading: mutation.isPending,
    create: async (
      payload: CreateOrganizationPayload,
    ): Promise<CreateOutcome> => {
      try {
        const organization = await mutation.mutateAsync(payload);
        return { status: 'created', organization };
      } catch (err) {
        const code = getApiErrorCode(err);

        if (code === CREATE_ORGANIZATION_ERRORS.POSSIBLE_DUPLICATE) {
          return { status: 'duplicate', candidates: duplicatesOf(err) };
        }
        if (
          code === CREATE_ORGANIZATION_ERRORS.SIRET_EXISTS ||
          code === CREATE_ORGANIZATION_ERRORS.INSEE_CODE_EXISTS
        ) {
          return { status: 'field-error', code };
        }
        return { status: 'error', message: getApiErrorMessage(err) };
      }
    },
  };
}
