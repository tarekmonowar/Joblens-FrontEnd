'use client';

// Multi-skill line chart — select up to 5 skills, toggle 7d/30d range.

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSkillTrends } from '@/hooks/useAnalytics';
import type { AnalyticsRange } from '@/types/analytics';

const PALETTE = ['#3b5bdb', '#12b886', '#fab005', '#e64980', '#7950f2'];
const DEFAULT_SKILLS = ['React', 'Node.js', 'TypeScript', 'Python', 'Docker'];

/**
 * Multi-line skill demand chart with skill multi-select (max 5) and range toggle.
 */
export function SkillTrendsChart() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(DEFAULT_SKILLS);

  const { data, isLoading, isError, refetch } = useSkillTrends({
    range,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
  });

  const chartData = useMemo(() => {
    if (!data?.series.length) return [];

    const dateSet = new Set<string>();
    for (const s of data.series) {
      for (const p of s.points) dateSet.add(p.date);
    }

    return [...dateSet]
      .sort()
      .map((date) => {
        const row: Record<string, string | number> = { date };
        for (const s of data.series) {
          const point = s.points.find((p) => p.date === date);
          row[s.skill] = point?.count ?? 0;
        }
        return row;
      });
  }, [data]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= 5) return prev;
      return [...prev, skill];
    });
  };

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-72" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load skill trends" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const skillsForChart =
    selectedSkills.length > 0
      ? selectedSkills
      : data.series.map((s) => s.skill);

  return (
    <Card className="h-full w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Skill trends</CardTitle>
          <CardDescription>Job postings mentioning selected skills over time</CardDescription>
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
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {DEFAULT_SKILLS.map((skill) => (
            <label
              key={skill}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => toggleSkill(skill)}
              />
              {skill}
            </label>
          ))}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => String(label)}
                formatter={(value, name) => [`${value ?? 0} jobs`, String(name)]}
              />
              <Legend />
              {skillsForChart.map((skill, i) => (
                <Line
                  key={skill}
                  type="monotone"
                  dataKey={skill}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
