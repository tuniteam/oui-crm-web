import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ERRORS } from '../constants/constants';
import { projectService } from '../services/projectService';
import type {
  ProjectListParams,
  ProjectListResponse,
} from '../types/projectList';

export const useProjects = (params: ProjectListParams) => {
  const query = useQuery<ProjectListResponse>({
    queryKey: ['projects', 'list', params],
    queryFn: () => projectService.getAll(params),
  });

  // Effet et non corps de rendu : sinon une requete en echec reaffiche un
  // toast a chaque rendu, donc a chaque frappe dans la recherche.
  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : ERRORS.FETCH_PROJECTS,
    );
  }, [query.isError, query.error]);

  return {
    response: query.data ?? null,
    projects: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
};
