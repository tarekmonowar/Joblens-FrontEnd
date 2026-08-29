'use client';

// Search results — infinite scroll via useSearch (reads debounced `?q=` from URL).

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Code2, MapPin, Search } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSearch } from '@/hooks/useSearch';

/**
 * Renders debounced search hits with infinite scroll and standard empty/error states.
 * Query comes from the URL (`?q=`) so it stays in sync with SearchBar debounce.
 */
export function SearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();
  const query = useSearch(q);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    query;

  const jobs = data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (q.length <= 1) {
    return (
      <div className="flex min-h-105 flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-5 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border bg-card text-primary shadow-sm">
          <Search className="size-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Search across every active role</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Enter at least two characters above. Try a role, company, skill, or location.
        </p>
        <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {[
            { icon: Code2, label: 'Skills', example: 'React, Python, DevOps' },
            { icon: Building2, label: 'Companies', example: 'Search hiring teams' },
            { icon: MapPin, label: 'Location', example: 'Dhaka, Remote, Hybrid' },
          ].map(({ icon: Icon, label, example }) => (
            <div key={label} className="rounded-2xl border bg-card p-4 text-left shadow-sm">
              <Icon className="size-4 text-primary" aria-hidden />
              <p className="mt-3 text-sm font-semibold">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{example}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="grid gap-5 lg:grid-cols-2" aria-label="Loading search results">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? 'Search failed'}
        onRetry={() => void refetch()}
      />
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No results"
        message={`No jobs matched "${q}". Try different keywords or browse the jobs board.`}
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Search results
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {data?.pages[0]?.meta.total ?? jobs.length} match
            {(data?.pages[0]?.meta.total ?? jobs.length) !== 1 ? 'es' : ''}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing results for &ldquo;{q}&rdquo;
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" aria-hidden />

      {isFetchingNextPage && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      )}

      {!hasNextPage && jobs.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          End of search results
        </p>
      )}
    </div>
  );
}
