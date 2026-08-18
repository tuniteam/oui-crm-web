import { Info } from 'lucide-react';
import { DetailsTabsNav } from '@/components/layouts/layout-1/shared/details-page/DetailsTabsNav';
import { USER_ROUTES } from '../../constants/user.routes';
import { USER_INFORMATION_UI } from '../../constants/users.constants';
import { useParams } from 'react-router';



export function UserDetailsTabsNav() {
  const { userId } = useParams<{ userId: string }>();
 
  const { TABS } = USER_INFORMATION_UI;

  const activeValue = TABS.INFORMATION.VALUE;

  const tabs = [
    {
      value: TABS.INFORMATION.VALUE,
      label: TABS.INFORMATION.LABEL,
      icon: <Info />,
      to: USER_ROUTES.USER_DETAILS(userId as string),
      testId: 'user-tab-informations',
    },
   
  ];

  return <DetailsTabsNav tabs={tabs} activeValue={activeValue} />;
}
