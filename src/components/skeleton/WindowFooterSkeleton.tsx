import { Skeleton } from '@/components/ui/skeleton';

export function WindowFooterSkeleton() {
  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Skeleton className="h-10 w-28 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}
