import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { ProjectDetailsResponse } from '../types/projectDetails';

export function useProject(projectId?: string, enabled: boolean = true) {
  return useQuery<ProjectDetailsResponse>({
    queryKey: ['projects', 'detail', projectId],
    queryFn: () => projectService.getOne(projectId as string),
    enabled: enabled && !!projectId,
  });
}
