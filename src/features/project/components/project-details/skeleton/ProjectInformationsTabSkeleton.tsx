import { Skeleton } from '@/components/ui/skeleton';
import { DetailsFieldSkeleton } from '@/components/layouts/layout-1/shared/details-page/skeletons/DetailsFieldSkeleton';

/** Reprend le layout reel de ProjectInformationsTab, section par section. */
export function ProjectInformationsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Identite */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <div className="md:col-span-3">
            <DetailsFieldSkeleton />
          </div>
        </div>
      </div>

      {/* Activite */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
          <DetailsFieldSkeleton />
        </div>
      </div>

      {/* Fonctionnalites */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
