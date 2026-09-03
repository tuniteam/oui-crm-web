import { useQuery } from '@tanstack/react-query';
import { useMeStore } from '@/contexts/useMeStore';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { contactService } from '../services/contact.service';
import type { Contact } from '../types/contact';

/**
 * Contacts d'un organisme — US-01-04.
 *
 * Pas de toast d'erreur ici, contrairement aux autres lectures : un `403` sur
 * une fiche hors périmètre est un cas prévu du contrat, que l'onglet explique
 * en toutes lettres. Un message d'échec par-dessus ferait passer une règle
 * d'accès pour une panne.
 */
export function useContacts(organizationId?: string, enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<Contact[]>({
    queryKey: ['organizations', 'contacts', projectId, organizationId],
    queryFn: async () =>
      (await contactService.getAll(organizationId as string)).data ?? [],
    enabled: enabled && !!organizationId,
    retry: false,
  });

  return {
    contacts: query.data ?? [],
    loading: query.isLoading,
    /** `ACCESS_DENIED` sur une fiche hors périmètre : à expliquer, pas à taire. */
    forbidden: getApiErrorCode(query.error) === 'ACCESS_DENIED',
    error: query.error,
  };
}
