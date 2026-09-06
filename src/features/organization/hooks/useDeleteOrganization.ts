import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import {
  DELETE_ORGANIZATION_TOASTS as TOASTS,
  ORGANIZATION_ENGAGEMENTS,
} from '../constants/organizationDelete.constants';
import { organizationService } from '../services/organization.service';

const HAS_ENGAGEMENTS = 'ORGANIZATION_HAS_ENGAGEMENTS';

/**
 * Traduit le `meta` du refus en une phrase qui nomme ce qui retient la fiche.
 *
 * `{ quotes: 1, contracts: 0, opportunities: 0, files: 0 }` devient « 1 devis ».
 * Les natures a zero sont ecartees : les enumerer noierait celle qui compte.
 */
function whatHolds(meta: Record<string, unknown> | null): string {
  if (!meta) return '';
  return (Object.keys(ORGANIZATION_ENGAGEMENTS) as (keyof typeof ORGANIZATION_ENGAGEMENTS)[])
    .map((key) => ({ key, n: Number(meta[key] ?? 0) }))
    .filter(({ n }) => n > 0)
    .map(({ key, n }) => ORGANIZATION_ENGAGEMENTS[key](n))
    .join(', ');
}

/** Suppression d'un organisme — US-01-13. Definitive depuis le 06/09/2026. */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, unknown, string>({
    mutationFn: (id) => organizationService.remove(id),

    onSuccess: () => {
      toast.success(TOASTS.DELETED);
      /*
       * La fiche disparait des lectures, et ses rendez-vous avec elle depuis
       * le 06/09 : l'agenda et les actions doivent recharger, sinon ils
       * afficheraient des creneaux rattaches a une fiche qui n'existe plus.
       */
      queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['organization'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['activities'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['agenda'], exact: false });
    },

    onError: (err) => {
      if (getApiErrorCode(err) !== HAS_ENGAGEMENTS) {
        toast.error(getApiErrorMessage(err) || TOASTS.ERROR);
        return;
      }

      /*
       * Le refus se raconte : ce qui retient la fiche, et par ou sortir. Un
       * contrat n'a pas de sortie — le dire evite qu'on la cherche.
       */
      const meta = getApiErrorMeta(err);
      const held = whatHolds(meta);
      const locked = Number(meta?.contracts ?? 0) > 0;

      toast.error(
        held ? TOASTS.HAS_ENGAGEMENTS(held) : TOASTS.ERROR,
        { description: locked ? TOASTS.HAS_CONTRACTS : TOASTS.REMOVE_FIRST },
      );
    },
  });

  return {
    loading: mutation.isPending,
    remove: async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
  };
}
