import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMeStore } from '@/contexts/useMeStore';
import { toast } from 'sonner';
import { SETTINGS_ERRORS } from '../constants/constants';
import { settingsService } from '../services/settings.service';
import type { SettingsResponse } from '../types/settings';

export function useSettings(enabled: boolean = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<SettingsResponse>({
    // Scopee par projet : sans cela, ouvrir un second projet servirait les
    // reglages du premier depuis le cache.
    queryKey: ['settings', 'detail', projectId],
    queryFn: () => settingsService.get(),
    enabled,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : SETTINGS_ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    settings: query.data ?? null,
    loading: query.isLoading,
    fetching: query.isFetching,
    isError: query.isError,
  };
}
