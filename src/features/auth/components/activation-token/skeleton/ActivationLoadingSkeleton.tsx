import { Skeleton } from '@/components/ui/skeleton';

export function ActivationLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-md space-y-4 p-2">

      {/* Icon skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="mx-auto h-6 w-40" />

      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </div>

      {/* Helper box */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}