'use client';

// Saved jobs page — grid/list view, notes, CSV export.

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { SavedGrid } from '@/components/saved/SavedGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSaved } from '@/hooks/useSavedJobs';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { exportCsvUrl } from '@/lib/api/savedApi';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Bookmark, Download, LayoutGrid, List } from 'lucide-react';

function SavedContent() {
  const [sort, setSort] = useState<string>('latest');
  const { data, isLoading, isError, error, refetch } = useSaved(sort);
  const savedView = useUiStore((s) => s.savedView);
  const setSavedView = useUiStore((s) => s.setSavedView);

  const downloadCsv = async () => {
    const token = useAuthStore.getState().accessToken;
    try {
      const res = await fetch(exportCsvUrl(), {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'saved-jobs.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Could not export CSV');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">Sort by</span>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-37.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest saved</SelectItem>
              <SelectItem value="oldest">Oldest saved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={savedView === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setSavedView('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant={savedView === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setSavedView('list')}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void downloadCsv()}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="min-h-80 rounded-2xl border bg-card">
          <ErrorState
            message={error?.message ?? 'Failed to load saved jobs'}
            onRetry={() => void refetch()}
          />
        </div>
      ) : !data?.length ? (
        <div className="min-h-80 rounded-2xl border bg-card">
          <EmptyState
            title="No saved jobs"
            message="Save promising roles while you browse, then compare them and keep personal notes here."
            action={
              <Button asChild>
                <Link href="/jobs">Explore jobs</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <SavedGrid items={data} />
      )}
    </>
  );
}

function SavedPageSkeleton() {
  return (
    <SavedPageFrame>
      <div className="mb-6 h-17.5 animate-pulse rounded-2xl border bg-accent" />
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </SavedPageFrame>
  );
}

function SavedPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-7 flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bookmark className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Your shortlist
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Saved jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review bookmarked roles, add private notes, and export your shortlist.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Auth-required saved jobs with notes and export. */
export default function SavedPage() {
  return (
    <ProtectedRoute fallback={<SavedPageSkeleton />}>
      <SavedPageFrame>
        <SavedContent />
      </SavedPageFrame>
    </ProtectedRoute>
  );
}
