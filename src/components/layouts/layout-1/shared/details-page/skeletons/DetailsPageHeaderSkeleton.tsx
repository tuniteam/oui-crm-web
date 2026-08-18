// src/components/layouts/layout-1/shared/details-page/skeletons/DetailsPageHeaderSkeleton.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DetailsPageHeaderSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
