import { PERMISSIONS } from '@/constants';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { DetailsPageHeader } from '@/components/layouts/layout-1/shared/details-page/DetailsPageHeader';
import { DetailsPageHeaderSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsPageHeaderSkeleton';
import { ProjectDetailsTabsNav } from '@/features/project/components/project-details/ProjectDetailsTabsNav';
import { ProjectInformationsTab } from '@/features/project/components/project-details/ProjectInformationsTab';
import { ProjectDetailsBodySkeleton } from '@/features/project/components/project-details/skeleton/ProjectDetailsBodySkeleton';
import { PROJECT_NOT_FOUND } from '@/features/project/constants/constants';
import { PROJECT_ROUTES } from '@/features/project/constants/routes.constants';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { useProject } from '@/features/project/hooks/useProject';

export function ProjectInformationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, isFetching, isError } = useProject(projectId);

  if (isLoading || isFetching) {
    return (
      <>
        <DetailsPageHeaderSkeleton />
        <ProjectDetailsBodySkeleton />
      </>
    );
  }

  // Sans cet etat, un 404 ou un 500 rendait une page entierement blanche.
  if (isError || !data) {
    return (
      <NotFoundState
        title={PROJECT_NOT_FOUND.TITLE}
        description={PROJECT_NOT_FOUND.DESCRIPTION}
        backRoute={PROJECT_ROUTES.PROJECTS}
        backLabel={PROJECT_NOT_FOUND.BACK}
      />
    );
  }

  return (
    <>
      <DetailsPageHeader
        title={data?.name ?? ''}
        backRoute={PROJECT_ROUTES.PROJECTS}
        targetId={data?.id ?? ''}
        editPermission={PERMISSIONS.PROJECTS.UPDATE}
      />

      <Card className="mb-4">
        <CardContent className="p-5">
          <ProjectDetailsTabsNav />
          {data ? <ProjectInformationsTab project={data} /> : null}
        </CardContent>
      </Card>
    </>
  );
}
