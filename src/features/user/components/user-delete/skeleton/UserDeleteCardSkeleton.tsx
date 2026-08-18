import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function UserDeleteCardSkeleton() {
  return (
    <Card className="my-4">
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-72" />
        </div>

        <Button variant="destructive" disabled>
          <Skeleton className="h-4 w-20" />
        </Button>
      </CardContent>
    </Card>
  );
}
