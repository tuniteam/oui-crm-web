import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { BOARD_UI } from '../constants/board.constants';
import { boardService } from '../services/board.service';
import {
  BOARD_PAGE_SIZE,
  type BoardCard,
  type BoardColumn,
  type BoardResponse,
} from '../types/board';
import type { SalesStatus } from '../types/organizationList';

/**
 * Le tableau de prospection — L1 · US-01-10.
 *
 * Une seule requete rend les cinq colonnes avec leur premiere page. Derouler
 * une colonne se fait a part, par `salesStatus` + `page`, et les cartes
 * obtenues s'ajoutent a celles deja affichees : recharger le tableau entier
 * pour cinquante cartes de plus serait du gaspillage, et ferait sauter les
 * quatre autres colonnes sous les yeux de l'utilisateur.
 */
export function useBoard() {
  const projectId = useMeStore((s) => s.activeProjectId);
  /** Pages supplementaires deja chargees, par colonne. */
  const [extra, setExtra] = useState<Partial<Record<SalesStatus, BoardCard[]>>>({});
  const [loadingMore, setLoadingMore] = useState<SalesStatus | null>(null);

  const query = useQuery<BoardResponse>({
    queryKey: ['organizations', 'board', projectId],
    queryFn: () => boardService.getBoard({ limit: BOARD_PAGE_SIZE }),
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : BOARD_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  // Un rechargement du tableau repart de la premiere page : les suites
  // accumulees ne valent plus rien.
  useEffect(() => {
    if (query.isFetching) return;
    setExtra({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.dataUpdatedAt]);

  const columns: BoardColumn[] = (query.data?.columns ?? []).map((c) => ({
    ...c,
    items: [...c.items, ...(extra[c.salesStatus] ?? [])],
  }));

  const loadMore = useCallback(
    async (salesStatus: SalesStatus) => {
      const column = columns.find((c) => c.salesStatus === salesStatus);
      if (!column) return;
      // La page suivante se calcule sur ce qu'on affiche, pas sur `meta.page` :
      // celui-ci reste a 1, le serveur ignorant nos ajouts.
      const page = Math.floor(column.items.length / column.meta.limit) + 1;
      setLoadingMore(salesStatus);
      try {
        const res = await boardService.getBoard({
          salesStatus,
          page,
          limit: BOARD_PAGE_SIZE,
        });
        const fresh = res.columns[0]?.items ?? [];
        setExtra((prev) => ({
          ...prev,
          [salesStatus]: [...(prev[salesStatus] ?? []), ...fresh],
        }));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : BOARD_UI.ERRORS.FETCH,
        );
      } finally {
        setLoadingMore(null);
      }
    },
    [columns],
  );

  return {
    columns,
    loading: query.isLoading,
    loadMore,
    loadingMore,
  };
}
