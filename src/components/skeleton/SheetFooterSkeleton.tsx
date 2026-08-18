import { Skeleton } from '@/components/ui/skeleton';

export function SheetFooterSkeleton() {
  return (
    <div className="flex w-full justify-end gap-2">
      <Skeleton className="h-10 w-28 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}
