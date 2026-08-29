'use client';

// Horizontal bar chart of top hiring companies — click a bar to filter jobs.

import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useCompanies } from '@/hooks/useAnalytics';

const BAR_COLOR = '#3b5bdb';

/**
 * Top companies by active job count — clicking a bar navigates to a filtered jobs search.
 */
export function TopCompaniesChart() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCompanies(10);

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-80" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top companies</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load company stats" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const chartData = [...data]
    .sort((a, b) => a.count - b.count)
    .map((c) => ({
      company: c.company.length > 28 ? `${c.company.slice(0, 28)}…` : c.company,
      fullName: c.company,
      count: c.count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top companies</CardTitle>
        <CardDescription>Most active hiring companies — click a bar to browse their jobs</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No company data yet</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="company"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? 0} jobs`, 'Open roles']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                    return row?.fullName ?? '';
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(row) => {
                    const name = (row as { fullName?: string }).fullName;
                    if (name) {
                      router.push(`/jobs?q=${encodeURIComponent(name)}`);
                    }
                  }}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR} className="hover:opacity-80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
