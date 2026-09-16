import { EMPTY_ARRAY } from '@/shared/constants/empty';
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
 * Table des regions, **taillee au demandeur** — US-00-07.
 *
 * Ce n'est plus une table statique. Le serveur la decoupe selon le perimetre
 * de l'appelant : un acces hors perimetre `NONE` limite au departement 89 ne
 * recoit qu'une entree, `Bourgogne-Franche-Comte -> ['89']`, tandis qu'un
 * commercial ou un administrateur recoit les quatorze regions entieres. Un
 * compteur « Normandie (5 departements) » est donc juste **pour cette
 * personne**, et differe de ce que voit quelqu'un d'autre. C'est voulu.
 *
 * D'ou l'utilisateur et le projet dans la cle : mise en cache globalement,
 * elle servait au suivant la decoupe du precedent — et `gcTime: Infinity` ne
 * l'aurait jamais relachee.
 *
 * La route demande `references:read`, que **tous les roles** possedent : elle
 * n'a plus besoin d'etre gardee.
 */
export function useGeoRegions(enabled = true) {
  const contactId = useMeStore((s) => s.me?.contactId);
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<GeoRegion[]>({
    queryKey: ['geo', 'regions', projectId, contactId],
    queryFn: async () => (await scopesService.getRegions()).data ?? [],
    enabled,
    /* La decoupe ne bouge pas tant que le perimetre de la personne ne bouge
       pas : inutile de la redemander a chaque ouverture du panneau. */
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { regions: query.data ?? EMPTY_ARRAY, loading: query.isLoading };
}
