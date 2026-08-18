import { Skeleton } from '@/components/ui/skeleton';

export function SidebarMenuSkeleton() {
  return (
    <div className="flex flex-col grow min-h-0">
      {/* Header skeleton - Client badge */}
      <div className="sidebar-menu-header shrink-0 px-5 pt-5 lg:pt-6 pb-3">
        <div className="rounded-lg p-3 space-y-2 bg-accent/50">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Menu items skeleton */}
      <div className="flex-1 px-5 space-y-4 pt-2">
        {/* Dashboard item */}
        <div className="flex items-center gap-3 h-8 ps-1">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Section heading */}
        <Skeleton className="h-3 w-20 mt-4" />

        {/* Menu items */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 h-8 ps-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}