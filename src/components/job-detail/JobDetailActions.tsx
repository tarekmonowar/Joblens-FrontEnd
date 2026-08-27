'use client';

// Customize resume · apply · original post · share — grouped on the left.

import { ApplyButton } from '@/components/job-detail/ApplyButton';
import { CustomizeResumeButton } from '@/components/job-detail/CustomizeResumeButton';
import { OriginalPostLink } from '@/components/job-detail/OriginalPostLink';
import { ShareButton } from '@/components/job-detail/ShareButton';
import { cn } from '@/lib/utils';
import type { JobDetailDto } from '@/types/job';

type JobDetailActionsProps = {
  job: Pick<JobDetailDto, 'id' | 'isApplied' | 'sourceUrl' | 'title'>;
  className?: string;
};

/** Primary job actions in a left-aligned row. */
export function JobDetailActions({ job, className }: JobDetailActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <CustomizeResumeButton jobId={job.id} />
      <ApplyButton job={job} />
      <OriginalPostLink sourceUrl={job.sourceUrl} />
      <ShareButton jobId={job.id} title={job.title} />
    </div>
  );
}
