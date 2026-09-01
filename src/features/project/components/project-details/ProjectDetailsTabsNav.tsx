import { Info } from 'lucide-react';
import { useParams } from 'react-router';
import { DetailsTabsNav } from '@/components/layouts/layout-1/shared/details-page/DetailsTabsNav';
import { PROJECT_INFORMATION_UI } from '../../constants/constants';
import { PROJECT_ROUTES } from '../../constants/routes.constants';

export function ProjectDetailsTabsNav() {
  const { projectId } = useParams<{ projectId: string }>();
  const { TABS } = PROJECT_INFORMATION_UI;

  const activeValue = TABS.INFORMATION.VALUE;

  const tabs = [
    {
      value: TABS.INFORMATION.VALUE,
      label: TABS.INFORMATION.LABEL,
      icon: <Info />,
      to: PROJECT_ROUTES.PROJECT_DETAILS(projectId as string),
      testId: 'project-tab-informations',
    },
  ];

  return <DetailsTabsNav tabs={tabs} activeValue={activeValue} />;
}
