// src/features/users/components/UserDetailsBodySkeleton.tsx
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserInformationsTabSkeleton } from './UserInformationsTabSkeleton';
import { USER_INFORMATION_UI } from '../../../constants/users.constants';

export function UserDetailsBodySkeleton() {
  const { TABS } = USER_INFORMATION_UI;

  return (
    <Card className="mb-4">
      <Tabs value={TABS.INFORMATION.VALUE}>
        <CardHeader className="p-5 border-b-0">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value={TABS.INFORMATION.VALUE} disabled>
              <Info />
              {TABS.INFORMATION.LABEL}
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-0 py-4">
          <UserInformationsTabSkeleton />
        </CardContent>
      </Tabs>
    </Card>
  );
}
