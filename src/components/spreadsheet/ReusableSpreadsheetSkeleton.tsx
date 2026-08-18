import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type ReusableSpreadsheetSkeletonProps = {
  columns: number;
  rows?: number;
  infoNote?: string;
};

export function ReusableSpreadsheetSkeleton({
  columns,
  rows = 4,
  infoNote,
}: ReusableSpreadsheetSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {infoNote && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{infoNote}</AlertDescription>
        </Alert>
      )}
      <div className="w-full border rounded-md overflow-hidden">
        <div
          className="grid gap-3 px-4 py-3 bg-muted/50"
          style={{ gridTemplateColumns: `2rem repeat(${columns}, minmax(0, 1fr))` }}
        >
          <Skeleton className="h-4 w-6" />
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="grid gap-3 px-4 py-3"
              style={{ gridTemplateColumns: `2rem repeat(${columns}, minmax(0, 1fr))` }}
            >
              <Skeleton className="h-4 w-6" />
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={c} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}