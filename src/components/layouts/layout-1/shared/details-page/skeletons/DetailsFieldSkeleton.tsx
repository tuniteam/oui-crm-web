// src/components/layouts/layout-1/shared/details-page/skeletons/DetailsFieldSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function DetailsFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
