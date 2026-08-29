'use client';

// List of the user's job alerts with loading, empty, and error states.

import { AlertCard } from '@/components/alerts/AlertCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/useAlerts';

/**
 * Renders all alerts for the signed-in user.
 */
export function AlertList() {
  const { data, isPending, isError, error, refetch } = useAlerts();

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border bg-card p-6">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-44" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? 'Failed to load alerts'}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data?.length) {
    return (
      <div className="min-h-[420px] rounded-2xl border bg-card">
        <EmptyState
          title="No alerts yet"
          message="Create your first alert to receive matching roles without repeatedly searching."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
