'use client';

// Grouped bar chart of salary min/avg/max by role — BDT/USD toggle from uiStore.

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSalaries } from '@/hooks/useAnalytics';
import { useUiStore } from '@/store/uiStore';

const ROLE_LABELS: Record<string, string> = {
  FULLSTACK: 'Fullstack',
  BACKEND: 'Backend',
  FRONTEND: 'Frontend',
  SOFTWARE_ENGINEER: 'Software Eng.',
  MOBILE: 'Mobile',
  DEVOPS: 'DevOps',
  QA: 'QA',
  OTHER: 'Other',
};

/**
 * Salary ranges by developer role — currency toggle + optional experience filter.
 */
export function SalaryChart() {
  const currency = useUiStore((s) => s.currency);
  const setCurrency = useUiStore((s) => s.setCurrency);
  const [experience, setExperience] = useState<number | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useSalaries({
    currency,
    experience,
  });

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salaries by role</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load salary data" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((row) => ({
    role: ROLE_LABELS[row.role] ?? row.role,
    min: row.min,
    avg: row.avg,
    max: row.max,
  }));

  const symbol = currency === 'BDT' ? '৳' : '$';

  return (
    <Card className="h-full w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Salaries by role</CardTitle>
          <CardDescription>Min, average, and max from active listings</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={currency === 'BDT' ? 'default' : 'outline'}
            onClick={() => setCurrency('BDT')}
          >
            BDT
          </Button>
          <Button
            type="button"
            size="sm"
            variant={currency === 'USD' ? 'default' : 'outline'}
            onClick={() => setCurrency('USD')}
          >
            USD
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max experience (years)</span>
            <span className="font-medium tabular-nums">
              {experience !== undefined ? experience : 'Any'}
            </span>
          </div>
          <Slider
            min={0}
            max={15}
            step={1}
            value={[experience ?? 0]}
            onValueChange={([v]) => setExperience(v === 0 ? undefined : v)}
          />
        </div>

        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No salary data for {currency}
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="role" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${symbol}${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${symbol}${Number(value ?? 0).toLocaleString()}`,
                    String(name),
                  ]}
                />
                <Legend />
                <Bar dataKey="min" name="Min" fill="#91a7ff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="avg" name="Avg" fill="#3b5bdb" radius={[2, 2, 0, 0]} />
                <Bar dataKey="max" name="Max" fill="#1c3faa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
