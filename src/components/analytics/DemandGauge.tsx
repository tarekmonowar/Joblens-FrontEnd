'use client';

// Radial demand-index gauge plus a small history line chart below.

import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useDemandIndex } from '@/hooks/useAnalytics';

/**
 * Market demand gauge (0–100) with a 14-day history sparkline.
 */
export function DemandGauge() {
  const { data, isLoading, isError, refetch } = useDemandIndex();

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-72" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demand index</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load demand index" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const gaugeData = [{ name: 'Demand', value: Math.round(data.current), fill: '#3b5bdb' }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand index</CardTitle>
        <CardDescription>Composite market heat score (0–100) with recent trend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative mx-auto h-52 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={14}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: 'var(--muted)' }}
                dataKey="value"
                cornerRadius={8}
                animationDuration={900}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className="text-4xl font-bold tabular-nums text-primary">
              {Math.round(data.current)}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {data.history.length > 0 && (
          <div className="h-36 w-full">
            <p className="mb-2 text-xs font-medium text-muted-foreground">14-day history</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}`, 'Index']}
                  labelFormatter={(label) => String(label)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b5bdb"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
