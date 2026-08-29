'use client';

// Stacked area chart of daily job postings by source over 7d/30d.

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { useTimeline } from '@/hooks/useAnalytics';
import type { AnalyticsRange } from '@/types/analytics';

const SOURCE_COLORS: Record<string, string> = {
  LINKEDIN: '#0a66c2',
  INDEED: '#2164f3',
  GLASSDOOR: '#0caa41',
  BDJOBS: '#e03131',
  OTHER: '#868e96',
};

/**
 * Area chart of daily postings with per-source color bands.
 */
export function TimelineChart() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data, isLoading, isError, refetch } = useTimeline(range);

  const { chartData, sources } = useMemo(() => {
    if (!data?.length) return { chartData: [], sources: [] as string[] };

    const sourceSet = new Set<string>();
    for (const point of data) {
      for (const key of Object.keys(point.bySource)) {
        sourceSet.add(key);
      }
    }

    const sourceList = [...sourceSet].sort();
    const rows = data.map((point) => {
      const row: Record<string, string | number> = {
        date: point.date,
        total: point.total,
      };
      for (const src of sourceList) {
        row[src] = point.bySource[src] ?? 0;
      }
      return row;
    });

    return { chartData: rows, sources: sourceList };
  }, [data]);

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-72" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posting timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load timeline" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Posting timeline</CardTitle>
          <CardDescription>Daily new job postings by source</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={range === '7d' ? 'default' : 'outline'}
            onClick={() => setRange('7d')}
          >
            7 days
          </Button>
          <Button
            type="button"
            size="sm"
            variant={range === '30d' ? 'default' : 'outline'}
            onClick={() => setRange('30d')}
          >
            30 days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No timeline data yet</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip labelFormatter={(label) => String(label)} />
                <Legend />
                {sources.map((src) => (
                  <Area
                    key={src}
                    type="monotone"
                    dataKey={src}
                    stackId="1"
                    stroke={SOURCE_COLORS[src] ?? '#868e96'}
                    fill={SOURCE_COLORS[src] ?? '#868e96'}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
