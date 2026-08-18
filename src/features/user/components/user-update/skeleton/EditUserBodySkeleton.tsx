// src/features/users/components/EditUserBodySkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { DetailsFieldSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsFieldSkeleton';

export function EditUserBodySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>
    </div>
  );
}
