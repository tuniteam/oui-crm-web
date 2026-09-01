import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { REFERENCES_UI } from '../constants/reference-items.constants';
import { referenceItemsService } from '../services/reference-items.service';
import type {
  CreateReferenceItemPayload,
  ReferenceItemsResponse,
  UpdateReferenceItemPayload,
} from '../types/reference-items';

const keyFor = (projectId: string | null) => ['reference-items', projectId];

export function useReferenceItems(enabled: boolean = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<ReferenceItemsResponse>({
    queryKey: keyFor(projectId),
    queryFn: () => referenceItemsService.getAll(),
    enabled,
    // Le contrat prevoit de charger une fois et de garder en cache.
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : REFERENCES_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    items: query.data?.data ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
  };
}

export function useCreateReferenceItem() {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateReferenceItemPayload) =>
      referenceItemsService.create(payload),
    onSuccess: () => {
      toast.success(REFERENCES_UI.TOASTS.CREATED);
      queryClient.invalidateQueries({ queryKey: keyFor(projectId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const create = async (payload: CreateReferenceItemPayload) => {
    try {
      return await mutation.mutateAsync(payload);
    } catch {
      return null;
    }
  };

  return { create, loading: mutation.isPending };
}

export function useUpdateReferenceItem() {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReferenceItemPayload;
    }) => referenceItemsService.update(id, payload),
    onSuccess: () => {
      toast.success(REFERENCES_UI.TOASTS.UPDATED);
      queryClient.invalidateQueries({ queryKey: keyFor(projectId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = async (id: string, payload: UpdateReferenceItemPayload) => {
    try {
      return await mutation.mutateAsync({ id, payload });
    } catch {
      return null;
    }
  };

  return { update, loading: mutation.isPending };
}
