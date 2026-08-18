// src/components/layouts/layout-1/shared/details-page/DetailsSection.tsx
import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

export function DetailsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {action}
      </div>
      <Separator className="my-3" />
      {children}
    </div>
  );
}
