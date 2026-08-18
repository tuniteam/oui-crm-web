// src/components/layouts/layout-1/shared/details-page/DetailsTabsNav.tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMeStore } from '@/contexts/useMeStore';

export type DetailsTab = {
  value: string;
  label: string;
  icon: ReactNode;
  to: string;
  permission?: string;
  testId?: string;
  badge?: ReactNode;
};

type DetailsTabsNavProps = {
  tabs: DetailsTab[];
  activeValue: string;
};

export function DetailsTabsNav({ tabs, activeValue }: DetailsTabsNavProps) {
  const meStore = useMeStore();
  const hasPermission = meStore.hasPermission;

  return (
    <Tabs value={activeValue} className="pb-5">
      <TabsList variant="line" className="w-full justify-start">
        {tabs.map((tab) => {
          if (tab.permission && !hasPermission(tab.permission)) {
            return null;
          }
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              data-testid={tab.testId}
            >
              <Link to={tab.to}>
                {tab.icon}
                {tab.label}
                {tab.badge}
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
