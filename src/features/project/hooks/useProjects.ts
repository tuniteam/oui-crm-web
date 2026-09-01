import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PROJECT_ERRORS } from '../constants/project.constants';
import { projectService } from '../services/project.service';
import type { ProjectListParams, ProjectListResponse } from '../types/project';

export const useProjects = (params: ProjectListParams) => {
  const query = useQuery<ProjectListResponse>({
    queryKey: ['projects', 'list', params],
    queryFn: () => projectService.getAll(params),
  });

  if (query.isError) {
    const msg =
      query.error instanceof Error
        ? query.error.message
        : PROJECT_ERRORS.FETCH_PROJECTS;
    toast.error(msg);
  }

  return {
    response: query.data ?? null,
    projects: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
};
