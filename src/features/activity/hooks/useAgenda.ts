import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { AGENDA_UI } from '../constants/agenda.constants';
import { agendaService } from '../services/agenda.service';
import type {
  AgendaItem,
  AgendaKind,
  AgendaParams,
} from '../types/agenda';

/**
 * L'agenda d'une periode — L1 · US-01-09.
 *
 * `from` et `to` sont obligatoires : une requete par periode affichee, ce que
 * le contrat prevoit en donnant a `limit` le maximum par defaut.
 *
 * **Toutes les pages sont chargees avant de rendre.** Un mois charge se
 * pagine ; se contenter de la premiere page peindrait une grille a laquelle il
 * manque des rendez-vous, sans que rien ne le dise. Deux requetes valent mieux
 * qu'un rendez-vous invisible.
 */
export function useAgenda(params: Omit<AgendaParams, 'page'>) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<{
    events: AgendaItem[];
    counts: Record<AgendaKind, number>;
  }>({
    queryKey: ['agenda', projectId, params],
    queryFn: async () => {
      const first = await agendaService.getPage({ ...params, page: 1 });
      // Les comptes portent sur toute la fenetre : ils ne se paginent pas.
      const counts = first.counts;
      const pages = first.meta?.totalPages ?? 1;
      if (pages <= 1) return { events: first.data, counts };

      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
          agendaService.getPage({ ...params, page: i + 2 }),
        ),
      );
      return {
        events: [first, ...rest].flatMap((r) => r.data),
        counts,
      };
    },
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : AGENDA_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    events: query.data?.events ?? [],
    counts: query.data?.counts ?? null,
    loading: query.isLoading,
  };
}
