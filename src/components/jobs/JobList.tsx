'use client';

// Left column of the jobs board — a self-scrolling, paginated list of rows.
// One job is "selected" at a time; the detail opens in the right pane.

import { useEffect, useRef } from 'react';
import { JobListItem } from '@/components/jobs/JobListItem';
import { JobPagination } from '@/components/jobs/JobPagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { useJobsPage } from '@/hooks/useJobs';

type JobsPageQuery = ReturnType<typeof useJobsPage>;

type JobListProps = {
  query: JobsPageQuery;
  selectedId: string | null;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onResetFilters?: () => void;
  className?: string;
};

function RowSkeleton() {
  return (
    <div className="space-y-2 border-b px-4 py-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/**
 * Renders the paginated job rows with loading / empty / error states. Pagination
 * sits at the bottom of the scroll area (LinkedIn-style — scroll to see it).
 */
export function JobList({
  query,
  selectedId,
  onSelect,
  page,
  onPageChange,
  onResetFilters,
  className,
}: JobListProps) {
  const { data, isPending, isError, error, refetch, isFetching } = query;
  const scrollRef = useRef<HTMLDivElement>(null);

  const jobs = data?.data ?? [];
  const meta = data?.meta;

  // Jump back to the top of the list whenever the page changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [page]);

  return (
    <section
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-card',
        className,
      )}
      aria-label="Job listings"
    >
      {/* Result summary header */}
      <header className="flex shrink-0 items-center border-b px-4 py-2.5 text-xs text-muted-foreground">
        <span>{meta ? `${meta.total.toLocaleString()} jobs` : 'Jobs'}</span>
      </header>

      {/* Scrollable rows */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-busy={isFetching}
      >
        {isPending ? (
          Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message={error?.message ?? 'Failed to load jobs'}
              onRetry={() => void refetch()}
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No jobs found"
              message="Try adjusting your filters or check back after the next fetch run."
              action={
                onResetFilters ? (
                  <Button variant="outline" onClick={onResetFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className={cn(isFetching && 'opacity-60 transition-opacity')}>
            {jobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                selected={job.id === selectedId}
                onSelect={onSelect}
              />
            ))}

            {/* Pagination at the end of the list — only visible after scrolling down */}
            {meta && meta.totalPages > 1 && (
              <div className="border-t bg-muted/20 px-2 py-3">
                <JobPagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
