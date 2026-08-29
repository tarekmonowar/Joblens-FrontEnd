'use client';

// Side-by-side tables of rising and declining skills from the demand index.

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useDemandIndex } from '@/hooks/useAnalytics';

type SkillRowProps = {
  skill: string;
  growth: number;
  positive: boolean;
};

function SkillRow({ skill, growth, positive }: SkillRowProps) {
  const Icon = positive ? TrendingUp : TrendingDown;
  const colorClass = positive ? 'text-success' : 'text-destructive';

  return (
    <tr className="border-b last:border-0">
      <td className="py-2.5 pr-4 text-sm font-medium">{skill}</td>
      <td className={`py-2.5 text-right text-sm font-semibold tabular-nums ${colorClass}`}>
        <span className="inline-flex items-center justify-end gap-1">
          <Icon className="size-3.5" aria-hidden />
          {positive ? '+' : ''}
          {growth}%
        </span>
      </td>
    </tr>
  );
}

/**
 * Two tables — fastest growing and fastest declining skills week-over-week.
 */
export function RisingDecliningSkills() {
  const { data, isLoading, isError, refetch } = useDemandIndex();

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-64" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill momentum</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load skill momentum" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill momentum</CardTitle>
        <CardDescription>Week-over-week change in skill mention frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
              <TrendingUp className="size-4" aria-hidden />
              Rising skills
            </h3>
            {data.risingSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rising skills this period</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Skill</th>
                    <th className="pb-2 text-right font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {data.risingSkills.map((row) => (
                    <SkillRow key={row.skill} skill={row.skill} growth={row.growth} positive />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
              <TrendingDown className="size-4" aria-hidden />
              Declining skills
            </h3>
            {data.decliningSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No declining skills this period</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Skill</th>
                    <th className="pb-2 text-right font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.decliningSkills.map((row) => (
                    <SkillRow
                      key={row.skill}
                      skill={row.skill}
                      growth={row.growth}
                      positive={false}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
