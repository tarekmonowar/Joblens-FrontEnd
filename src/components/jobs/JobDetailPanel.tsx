'use client';

// Right column of the jobs board — full detail of the selected job.
// Header (title + actions) is pinned; the body scrolls independently.

import { ArrowLeft } from 'lucide-react';
import { useJob } from '@/hooks/useJobs';
import { JobHeader } from '@/components/job-detail/JobHeader';
import { JobDescription } from '@/components/job-detail/JobDescription';
import { SimilarJobs } from '@/components/job-detail/SimilarJobs';
import { JobDetailActions } from '@/components/job-detail/JobDetailActions';
import { SkillTags } from '@/components/jobs/SkillTags';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { cn, formatJobListedTime } from '@/lib/utils';

type JobDetailPanelProps = {
  jobId: string | null;
  /** Keeps the detail pane in a loading state while the board finds its first job. */
  boardPending?: boolean;
  /** Shown on mobile to close the full-screen detail overlay. */
  onBack?: () => void;
  className?: string;
};

const CONTAINER = 'flex h-full flex-col overflow-hidden rounded-xl border bg-card';

/**
 * Fetches and renders the selected job. Shows a placeholder when nothing is
 * selected, a skeleton while loading, and an error state on failure.
 */
export function JobDetailPanel({
  jobId,
  boardPending = false,
  onBack,
  className,
}: JobDetailPanelProps) {
  const { data: job, isPending, isError, error, refetch } = useJob(jobId ?? '');

  if (boardPending || (jobId && isPending)) {
    return (
      <div className={cn(CONTAINER, className)}>
        <div className="shrink-0 space-y-4 border-b px-5 py-5">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-6 px-5 py-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className={cn(CONTAINER, className)}>
        <div className="flex flex-1 items-center justify-center p-8">
          <EmptyState
            title="Select a job"
            message="Pick a role from the list to see the full details here."
          />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className={cn(CONTAINER, className)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <ErrorState
            message={error?.message ?? 'Job not found'}
            onRetry={() => void refetch()}
          />
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back to list
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(CONTAINER, className)}>
      {/* Pinned header — title, salary, and the primary actions */}
      <div className="shrink-0 space-y-4 border-b px-5 py-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}

        <JobHeader job={job} />

        <JobDetailActions job={job} />
      </div>

      {/* Scrollable detail body */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
        <section>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Skills</h2>
          <SkillTags skills={job.skills} max={20} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Description</h2>
          <JobDescription markdown={job.description} />
        </section>

        {job.requirements.length > 0 && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">Requirements</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {job.benefits.length > 0 && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">Benefits</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {job.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <SimilarJobs jobId={job.id} limit={3} />

        <p className="text-xs text-muted-foreground">
          Listed {formatJobListedTime(job)} · {job.viewCount} views
        </p>
      </div>
    </div>
  );
}
