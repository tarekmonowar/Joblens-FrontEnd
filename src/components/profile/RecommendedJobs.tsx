'use client';

// Recommended jobs ranked by skill overlap with the user's profile.

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { JobCard } from '@/components/jobs/JobCard';
import { useRecommendations } from '@/hooks/useProfile';

/**
 * Grid of job cards tailored to the signed-in user's skills.
 */
export function RecommendedJobs() {
  const { data, isLoading, isError, error, refetch } = useRecommendations(6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Recommended for you</CardTitle>
          <p className="text-sm text-muted-foreground">
            Active jobs ranked by skill overlap with your profile
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/jobs">Browse all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message={error?.message ?? 'Could not load recommendations'}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && !data?.length && (
          <EmptyState
            title="No recommendations yet"
            message="Add skills to your profile and we will suggest matching jobs."
          />
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
