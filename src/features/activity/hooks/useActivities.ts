import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { ACTIVITIES_UI } from '../constants/activity.constants';
import type { ActivityListParams, ActivityListResponse } from '../types/activity';
import { activityService } from '../services/activity.service';

/**
 * Les actions d'une fiche — L1 · US-01-08.
 *
 * Le commercial est en scope `OWN` : le serveur ne lui rend que **ses**
 * actions, filtre en SQL. On ne refiltre **jamais** cote front, sous peine de
 * masquer des lignes aux roles qui ont le droit de tout voir.
 */
export function useActivities(params: ActivityListParams, enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<ActivityListResponse>({
    queryKey: ['activities', 'list', projectId, params],
    queryFn: () => activityService.getAll(params),
    enabled,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : ACTIVITIES_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    activities: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
  };
}
