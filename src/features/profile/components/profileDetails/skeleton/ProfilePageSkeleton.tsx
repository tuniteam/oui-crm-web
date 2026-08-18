import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:auto-rows-fr">
        <Skeleton className="h-[260px] w-full rounded-xl" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
    </div>
  );
}