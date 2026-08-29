import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Mirrors the full job-card structure so result grids do not resize after loading. */
export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn('min-h-67.5 gap-0 overflow-hidden py-0', className)}
      aria-hidden
    >
      <CardContent className="space-y-3 border-b px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
      <CardContent className="grid flex-1 grid-cols-4 gap-4 border-b px-4 py-4">
        <div className="col-span-3 space-y-2">
          <Skeleton className="h-3 w-12" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardContent>
      <CardContent className="flex flex-wrap gap-3 px-4 py-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}

/** Card-shaped analytics placeholder with the same header and chart geometry. */
export function AnalyticsCardSkeleton({
  chartClassName = 'h-72',
  className,
}: {
  chartClassName?: string;
  className?: string;
}) {
  return (
    <Card className={cn('h-full w-full min-w-0 self-stretch', className)} aria-hidden>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-3/5" />
      </CardHeader>
      <CardContent className="min-w-0">
        <Skeleton className={cn('w-full rounded-lg', chartClassName)} />
      </CardContent>
    </Card>
  );
}
