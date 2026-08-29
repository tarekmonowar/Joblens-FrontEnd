import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Full-text search across developer jobs in Bangladesh.',
};

function SearchBarFallback() {
  return <Skeleton className="mx-auto h-12 w-full max-w-2xl rounded-lg" />;
}

function SearchResultsFallback() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full-text job search with debounce, recent searches, and infinite scroll. */
export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-card px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Search className="size-6" aria-hidden />
          </div>
          <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            Smart job discovery
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your next role</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Search active roles by title, company, technology, or the way you want to work.
          </p>

          <div className="mt-7">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      <section className="mt-8 min-h-130" aria-label="Search results">
        <Suspense fallback={<SearchResultsFallback />}>
          <SearchResults />
        </Suspense>
      </section>
    </div>
  );
}
