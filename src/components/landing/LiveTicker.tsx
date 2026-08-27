'use client';

// Scrolling marquee of recent jobs — prepends on job:new socket events.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrending } from '@/hooks/useJobs';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import type { JobCardDto } from '@/types/job';
import type { JobNewPayload } from '@/types/socket';

const MAX_TICKER_JOBS = 20;

/** Merge socket-prepended jobs with the trending seed, deduped by id. */
function mergeTickerJobs(prepended: JobCardDto[], trending: JobCardDto[]): JobCardDto[] {
  const prependedIds = new Set(prepended.map((j) => j.id));
  const base = trending.filter((j) => !prependedIds.has(j.id));
  return [...prepended, ...base].slice(0, MAX_TICKER_JOBS);
}

/**
 * Horizontal ticker seeded from trending jobs; new ingestions prepend via `job:new`.
 */
export function LiveTicker() {
  const { data: trending = [], isLoading } = useTrending();
  const [prepended, setPrepended] = useState<JobCardDto[]>([]);

  // Prepend freshly ingested jobs (dedupe by id, cap list length).
  useSocketEvent('job:new', (payload: JobNewPayload) => {
    if (!payload.jobs?.length) return;
    setPrepended((prev) => {
      const incomingIds = new Set(payload.jobs.map((j) => j.id));
      const rest = [...prev, ...trending].filter((j) => !incomingIds.has(j.id));
      return [...payload.jobs, ...rest].slice(0, MAX_TICKER_JOBS);
    });
  });

  const jobs = useMemo(() => mergeTickerJobs(prepended, trending), [prepended, trending]);

  if (isLoading && jobs.length === 0) {
    return (
      <div className="shrink-0 border-y bg-muted/40 py-3">
        <Skeleton className="mx-auto h-6 w-full max-w-4xl" />
      </div>
    );
  }

  if (jobs.length === 0) return null;

  // Duplicate items so the CSS marquee loops seamlessly.
  const items = [...jobs, ...jobs];

  return (
    <div className="shrink-0 border-y bg-muted/40 py-3" aria-label="Recently posted jobs">
      <div className="overflow-hidden">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap px-4">
          {items.map((job, i) => (
            <Link
              key={`${job.id}-${i}`}
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
            >
              <span className="font-medium">{job.title}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden />
                {job.company}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {job.location}
              </span>
              <span className="text-muted-foreground/50" aria-hidden>
                •
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
