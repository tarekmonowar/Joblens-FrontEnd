'use client';

// Applied jobs tracker — jobs the user marked as Applied.

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { JobCard } from '@/components/jobs/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { Button } from '@/components/ui/button';
import { useApplied, useUnapply } from '@/hooks/useApplications';
import Link from 'next/link';

function AppliedContent() {
  const { data, isPending, isError, error, refetch } = useApplied();
  const unapplyMutation = useUnapply();

  if (isPending) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? 'Failed to load applied jobs'}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No applications yet"
        message="When you click Apply on a job, it will appear here."
        action={
          <Button variant="outline" asChild>
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {data.map(({ job, appliedAt }) => (
        <div key={job.id} className="relative">
          <JobCard job={{ ...job, isApplied: true }} badge="Applied" />
          <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span>Applied {new Date(appliedAt).toLocaleDateString()}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => unapplyMutation.mutate(job.id)}
              disabled={
                unapplyMutation.isPending && unapplyMutation.variables === job.id
              }
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Auth-required page listing jobs the user has applied to. */
export default function AppliedJobsPage() {
  const fallback = (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Applied jobs</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Jobs you&apos;ve marked as applied — track your search in one place.
      </p>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <ProtectedRoute fallback={fallback}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Applied jobs</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Jobs you&apos;ve marked as applied — track your search in one place.
        </p>
        <AppliedContent />
      </div>
    </ProtectedRoute>
  );
}
