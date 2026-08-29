'use client';

// Jobs board — LinkedIn-style split view: selectable list (left) + detail (right).
// Filters live in a slide-over drawer; selection and page are stored in the URL.

import { Suspense, useCallback, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useJobFilters } from '@/hooks/useJobFilters';
import { useOverview } from '@/hooks/useAnalytics';
import { useJobsPage } from '@/hooks/useJobs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { FilterDrawer } from '@/components/jobs/FilterDrawer';
import { PostedDropdown } from '@/components/jobs/PostedDropdown';
import { SortDropdown } from '@/components/jobs/SortDropdown';
import { JobList } from '@/components/jobs/JobList';
import { JobDetailPanel } from '@/components/jobs/JobDetailPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { JobFilters } from '@/types/job';

const PAGE_SIZE = 30;

/** Count applied filters (everything except sort) for the button badge. */
function countActiveFilters(filters: JobFilters): number {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.skills?.length) count += 1;
  if (filters.location) count += 1;
  if (filters.jobType?.length) count += 1;
  if (filters.category?.length) count += 1;
  if (filters.locationType?.length) count += 1;
  if (filters.remoteOnly) count += 1;
  if (filters.region) count += 1;
  if (filters.salaryMin != null) count += 1;
  if (filters.salaryMax != null) count += 1;
  if (filters.experienceMax != null) count += 1;
  if (filters.source?.length) count += 1;
  if (filters.datePosted) count += 1;
  return count;
}

function JobsBoardContent() {
  const {
    filters,
    page,
    selected: selectedFromUrl,
    setFilter,
    setPage,
    setSelected,
    reset,
  } = useJobFilters();
  const query = useJobsPage(filters, page, PAGE_SIZE);
  const { data: overview } = useOverview();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // Local selection updates instantly; URL syncs via history.replaceState for shareable links.
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);

  const jobs = query.data?.data ?? [];
  const meta = query.data?.meta;
  const activeCount = countActiveFilters(filters);
  const sort = filters.sort ?? 'latest';

  const handleSelect = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      setSelected(id);
    },
    [setSelected],
  );

  const handleSetFilter = useCallback(
    (partial: Partial<JobFilters>) => {
      setSelectedId(null);
      setFilter(partial);
    },
    [setFilter],
  );

  const handleSetPage = useCallback(
    (nextPage: number) => {
      setSelectedId(null);
      setPage(nextPage);
    },
    [setPage],
  );

  const handleReset = useCallback(() => {
    setSelectedId(null);
    reset();
  }, [reset]);

  // Prefer local selection; fall back to URL; on desktop auto-open the first row.
  const activeSelectedId =
    selectedId ?? selectedFromUrl ?? (isDesktop && jobs[0] ? jobs[0].id : null);

  // Refetch the board immediately when ingestion finishes (socket events).
  useSocketEvent('job:new', () => {
    void query.refetch();
  });
  useSocketEvent('stats:update', () => {
    void query.refetch();
  });

  const countLabel =
    meta &&
    (activeCount > 0
      ? overview?.totalActiveJobs != null
        ? `${meta.total.toLocaleString()} of ${overview.totalActiveJobs.toLocaleString()} jobs (filtered)`
        : `${meta.total.toLocaleString()} matching jobs (filtered)`
      : `${meta.total.toLocaleString()} active developer jobs`);

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-[1600px] flex-col px-3 sm:px-5">
      {activeCount > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Filters are narrowing results — home page shows all active developer jobs.
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Clear filters
          </Button>
        </div>
      )}
      {/* Toolbar: filters button + result count + posted/sort controls */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>

        <span className="hidden text-sm text-muted-foreground sm:inline">
          {countLabel ?? 'Loading…'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <PostedDropdown
            value={filters.datePosted}
            onChange={(datePosted) => handleSetFilter({ datePosted })}
          />
          <SortDropdown value={sort} onChange={(s) => handleSetFilter({ sort: s })} />
        </div>
      </div>

      {/* Split pane: list (left) + detail (right, desktop only) */}
      <div className="flex min-h-0 flex-1 gap-4 pb-3">
        <JobList
          query={query}
          selectedId={activeSelectedId}
          onSelect={(id) => handleSelect(id)}
          page={page}
          onPageChange={handleSetPage}
          onResetFilters={handleReset}
          className="w-full lg:w-100 lg:shrink-0 xl:w-110"
        />
        <JobDetailPanel
          key={activeSelectedId ?? 'none'}
          jobId={activeSelectedId}
          boardPending={query.isPending}
          className="hidden flex-1 lg:flex"
        />
      </div>

      {/* Mobile/tablet: detail opens as a full-screen overlay below the navbar */}
      {activeSelectedId && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 bg-background lg:hidden">
          <JobDetailPanel
            key={activeSelectedId}
            jobId={activeSelectedId}
            onBack={() => handleSelect(null)}
            className="h-full rounded-none border-0"
          />
        </div>
      )}

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={handleSetFilter}
        onReset={handleReset}
      />
    </div>
  );
}

function JobsBoardFallback() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-[1600px] flex-col px-3 sm:px-5">
      <div className="flex shrink-0 items-center justify-between gap-3 py-3">
        <Skeleton className="h-9 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 gap-4 pb-3">
        <Skeleton className="h-full w-full rounded-xl lg:w-100 lg:shrink-0 xl:w-110" />
        <Skeleton className="hidden h-full flex-1 rounded-xl lg:block" />
      </div>
    </div>
  );
}

/** Jobs board with URL-driven filters, pagination, and split-pane detail. */
export default function JobsPage() {
  return (
    <Suspense fallback={<JobsBoardFallback />}>
      <JobsBoardContent />
    </Suspense>
  );
}
