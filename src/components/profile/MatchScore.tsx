'use client';

// Circular match score — % of active jobs matching the user's skills.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useMatchScore } from '@/hooks/useProfile';

type MatchScoreProps = {
  size?: number;
};

/**
 * Radial percentage indicator for profile ↔ job market fit.
 */
export function MatchScore({ size = 140 }: MatchScoreProps) {
  const { data, isPending, isError, error, refetch } = useMatchScore();

  const score = Math.min(100, Math.max(0, data?.score ?? 0));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match score</CardTitle>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 py-4">
          <Skeleton className="rounded-full" style={{ width: size, height: size }} />
          <Skeleton className="h-4 w-44" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match score</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message={error?.message ?? 'Could not load match score'}
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Match score</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share of active jobs that overlap your profile skills
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 py-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-muted"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">{score}%</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Add skills to your profile to improve recommendations
        </p>
      </CardContent>
    </Card>
  );
}
