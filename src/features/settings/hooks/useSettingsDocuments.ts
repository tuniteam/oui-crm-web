import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMeStore } from '@/contexts/useMeStore';
import { toast } from 'sonner';
import { DOCUMENTS_UI, SETTINGS_ERRORS } from '../constants/constants';
import { TemplateInvalidError } from '../errors/TemplateInvalidError';
import { documentsService } from '../services/documents.service';
import type {
  SettingsDocumentsResponse,
  TemplateType,
} from '../types/documents';

const keyFor = (projectId: string | null) => ['settings', 'documents', projectId];

export function useSettingsDocuments(enabled: boolean = true) {
  const projectId = useMeStore((s) => s.activeProjectId);
  const query = useQuery<SettingsDocumentsResponse>({
    queryKey: keyFor(projectId),
    queryFn: () => documentsService.get(),
    enabled,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : SETTINGS_ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    documents: query.data ?? null,
    loading: query.isLoading,
    fetching: query.isFetching,
  };
}

export function useUploadTemplate() {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ type, file }: { type: TemplateType; file: File }) =>
      documentsService.uploadTemplate(type, file),
    onSuccess: () => {
      toast.success(DOCUMENTS_UI.TOASTS.TEMPLATE_UPLOADED);
      queryClient.invalidateQueries({ queryKey: keyFor(projectId) });
    },
  });

  /**
   * Renvoie les details d'un gabarit refuse plutot que de les noyer dans un
   * toast : la liste des balises manquantes doit rester affichee le temps de
   * corriger le fichier.
   */
  const upload = async (type: TemplateType, file: File) => {
    try {
      await mutation.mutateAsync({ type, file });
      return { ok: true as const, details: [] as string[] };
    } catch (error) {
      if (error instanceof TemplateInvalidError) {
        return { ok: false as const, details: error.details };
      }
      toast.error(
        error instanceof Error ? error.message : SETTINGS_ERRORS.FETCH,
      );
      return { ok: false as const, details: [] as string[] };
    }
  };

  return { upload, loading: mutation.isPending };
}

export function useUploadSignature() {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => documentsService.uploadSignature(file),
    onSuccess: () => {
      toast.success(DOCUMENTS_UI.TOASTS.SIGNATURE_UPLOADED);
      queryClient.invalidateQueries({ queryKey: keyFor(projectId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const upload = async (file: File) => {
    try {
      return await mutation.mutateAsync(file);
    } catch {
      return null;
    }
  };

  return { upload, loading: mutation.isPending };
}
