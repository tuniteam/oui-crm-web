import { useQuery } from '@tanstack/react-query';
import { documentsService } from '../services/documents.service';
import type { FileDownloadUrl } from '../types/documents';

/**
 * URL presignee d'un fichier stocke. Elle expire : on la re-demande plutot que
 * de la memoriser durablement, et on ne la resout que si un fileId est fourni.
 */
export function useFileUrl(fileId?: string) {
  const query = useQuery<FileDownloadUrl>({
    queryKey: ['files', 'download-url', fileId],
    queryFn: () => documentsService.getDownloadUrl(fileId as string),
    enabled: !!fileId,
    // Bien en deca de la duree de vie cote serveur.
    staleTime: 60 * 1000,
  });

  return { url: query.data?.url ?? null, loading: query.isLoading };
}
