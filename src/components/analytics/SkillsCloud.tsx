'use client';

// Word cloud of in-demand skills sized by posting frequency.

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSkillTrends } from '@/hooks/useAnalytics';

// react-d3-cloud touches the DOM — load only on the client.
const WordCloud = dynamic(() => import('react-d3-cloud'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
});

type CloudWord = { text: string; value: number };

/**
 * Skills word cloud — font size scales with the latest 7-day job mention count.
 */
export function SkillsCloud() {
  const { data, isLoading, isError, refetch } = useSkillTrends({ range: '7d' });

  const words: CloudWord[] = useMemo(() => {
    if (!data?.series.length) return [];

    return data.series
      .map((s) => {
        const points = s.points;
        const latest = points.length > 0 ? points[points.length - 1].count : 0;
        return { text: s.skill, value: latest };
      })
      .filter((w) => w.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-64" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills cloud</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load skills cloud" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills cloud</CardTitle>
        <CardDescription>Most mentioned skills in active job postings (7-day window)</CardDescription>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No skill data yet</p>
        ) : (
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-lg border bg-muted/20">
            <WordCloud
              data={words}
              width={560}
              height={280}
              font="system-ui, sans-serif"
              fontWeight="600"
              fontSize={(word: CloudWord) => {
                return Math.max(14, Math.min(48, Math.sqrt(word.value) * 6));
              }}
              rotate={() => (Math.random() > 0.7 ? 90 : 0)}
              padding={2}
              random={() => 0.5}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
