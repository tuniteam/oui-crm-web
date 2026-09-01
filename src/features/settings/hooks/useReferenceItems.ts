import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { REFERENCES_UI } from '../constants/reference-items.constants';
import { referenceItemsService } from '../services/reference-items.service';
import type {
  CreateReferenceItemPayload,
  ReferenceItem,
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

/**
 * Reordonne une categorie entiere.
 *
 * L'API n'expose pas de reordonnancement en lot : on envoie un PATCH par
 * valeur reellement deplacee. Un glisser-deposer de proche en proche n'en
 * touche donc que deux, pas toute la liste.
 *
 * La mise a jour est optimiste : sans cela, la valeur relachee reviendrait a
 * sa place le temps des appels, ce qui donne l'impression que le geste a
 * echoue.
 */
export function useReorderReferenceItems() {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();
  const key = keyFor(projectId);

  const mutation = useMutation({
    mutationFn: async (ordered: ReferenceItem[]) => {
      const moved = ordered
        .map((item, index) => ({ item, order: index + 1 }))
        .filter(({ item, order }) => item.order !== order);

      await Promise.all(
        moved.map(({ item, order }) =>
          referenceItemsService.update(item.id, { order }),
        ),
      );
      return moved.length;
    },

    onMutate: async (ordered: ReferenceItem[]) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReferenceItemsResponse>(key);

      const orders = new Map(
        ordered.map((item, index) => [item.id, index + 1] as const),
      );
      queryClient.setQueryData<ReferenceItemsResponse>(key, (current) =>
        current
          ? {
              data: current.data.map((item) =>
                orders.has(item.id)
                  ? { ...item, order: orders.get(item.id)! }
                  : item,
              ),
            }
          : current,
      );

      return { previous };
    },

    onError: (err: Error, _ordered, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(err.message);
    },

    onSuccess: (count) => {
      if (count > 0) toast.success(REFERENCES_UI.TOASTS.REORDERED);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    reorder: (ordered: ReferenceItem[]) => mutation.mutate(ordered),
    loading: mutation.isPending,
  };
}
