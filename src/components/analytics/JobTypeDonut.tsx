'use client';

// Donut chart of work arrangement + employment type distribution.

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useJobTypeBreakdown } from '@/hooks/useAnalytics';

const COLORS = ['#3b5bdb', '#12b886', '#fab005', '#e64980', '#7950f2', '#868e96'];

/**
 * Animated donut showing remote/onsite/hybrid and full/part/contract job mix.
 */
export function JobTypeDonut() {
  const { data, isLoading, isError, refetch } = useJobTypeBreakdown();

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-72" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job type mix</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load job type breakdown" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job type mix</CardTitle>
        <CardDescription>
          Work arrangement and employment type across active listings ({total.toLocaleString()} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No job type data yet</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value ?? 0} jobs`, String(name)]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
