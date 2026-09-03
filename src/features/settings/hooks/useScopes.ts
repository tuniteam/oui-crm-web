import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { SCOPES_UI } from '../constants/scopes.constants';
import { scopesService } from '../services/scopes.service';
import type { GeoRegion, Scope } from '../types/scopes';

/** Perimetres du projet — US-00-07. */
export function useScopes(enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<Scope[]>({
    queryKey: ['scopes', projectId],
    queryFn: async () => (await scopesService.getAll()).data ?? [],
    enabled,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : SCOPES_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return { scopes: query.data ?? [], loading: query.isLoading };
}

/**
 * Table des regions.
 *
 * Statique et de quatorze lignes : elle ne change pas d'une session a l'autre.
 * `staleTime: Infinity` evite de la redemander a chaque ouverture du panneau.
 */
export function useGeoRegions(enabled = true) {
  const query = useQuery<GeoRegion[]>({
    queryKey: ['geo', 'regions'],
    queryFn: async () => (await scopesService.getRegions()).data ?? [],
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { regions: query.data ?? [], loading: query.isLoading };
}
