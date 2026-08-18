// src/components/table/reusable-table-skeleton.tsx
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ReusableTableSkeletonProps = {
  /** number of header “controls” skeletons (search/filter chips etc.) */
  headerControls?: number;
  /** how many table columns to show */
  columns?: number;
  /** how many table rows to show */
  rows?: number;
  /** show pagination skeleton */
  showFooter?: boolean;
};

export function ReusableTableSkeleton({
  headerControls = 2,
  columns = 6,
  rows = 8,
  showFooter = true,
}: ReusableTableSkeletonProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex flex-wrap items-center gap-2 justify-between w-full">
          {/* Left side: search + filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input skeleton */}
            <Skeleton className="h-9 w-60" />

            {/* Extra header controls skeletons (filters etc.) */}
            {Array.from({ length: Math.max(0, headerControls - 1) }).map(
              (_, i) => (
                <Skeleton key={i} className="h-9 w-28" />
              ),
            )}
          </div>

          {/* Right side: toolbar actions skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardHeader>

      {/* Table skeleton */}
      <div className="w-full overflow-hidden">
        <div className="w-full border-t">
          {/* Header row */}
          <div
            className="grid gap-3 px-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Body rows */}
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, r) => (
              <div
                key={r}
                className="grid gap-3 px-4 py-3"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: columns }).map((_, c) => (
                  <Skeleton key={c} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFooter && (
        <CardFooter className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
