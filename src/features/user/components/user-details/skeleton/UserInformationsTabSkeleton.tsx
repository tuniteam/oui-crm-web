// src/features/users/components/UserInformationsTabSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { DetailsFieldSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsFieldSkeleton';

export function UserInformationsTabSkeleton() {

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" /> {/* Section title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>

      {/* Access */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" /> {/* Section title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>

      {/* Security */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-36" /> {/* Section title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" /> {/* Section title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>
    </div>
  );
}
