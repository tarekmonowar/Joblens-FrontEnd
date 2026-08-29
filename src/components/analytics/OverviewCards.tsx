'use client';

// Overview metric cards with animated counters and demand trend arrow.

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  DollarSign,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useOverview } from '@/hooks/useAnalytics';

/** Brief scale pulse when a counter value updates. */
function AnimatedValue({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const display = formatter ? formatter(value) : value.toLocaleString();
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.06, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="tabular-nums"
    >
      {display}
    </motion.span>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
};

function MetricCard({ icon, label, value, sub }: MetricCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-start gap-4 p-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Top-row overview cards — active jobs, new today, companies, salary, demand index.
 * Each card animates when data loads or updates.
 */
export function OverviewCards() {
  const { data, isLoading, isError, refetch } = useOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-6">
              <Skeleton className="size-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Could not load overview metrics" onRetry={() => void refetch()} />;
  }

  const trendUp = data.demandTrend > 0;
  const trendDown = data.demandTrend < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Sparkles;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        icon={<Briefcase className="size-5" aria-hidden />}
        label="Active developer jobs"
        value={<AnimatedValue value={data.totalActiveJobs} />}
        sub={`${data.newJobsToday.toLocaleString()} new today`}
      />
      <MetricCard
        icon={<Sparkles className="size-5" aria-hidden />}
        label="New jobs today"
        value={<AnimatedValue value={data.newJobsToday} />}
      />
      <MetricCard
        icon={<Building2 className="size-5" aria-hidden />}
        label="Companies hiring"
        value={<AnimatedValue value={data.companiesHiringThisMonth} />}
        sub="This month"
      />
      <MetricCard
        icon={<DollarSign className="size-5" aria-hidden />}
        label="Average salary (BDT)"
        value={
          <AnimatedValue
            value={data.averageSalaryBdt}
            formatter={(n) => (n > 0 ? `৳${n.toLocaleString()}` : '—')}
          />
        }
        sub="From latest snapshot"
      />
      <MetricCard
        icon={<TrendIcon className="size-5" aria-hidden />}
        label="Market demand index"
        value={<AnimatedValue value={Math.round(data.demandIndex)} />}
        sub={
          <span
            className={
              trendUp ? 'text-success' : trendDown ? 'text-destructive' : undefined
            }
          >
            {trendUp && `↑ ${data.demandTrend}% vs yesterday`}
            {trendDown && `↓ ${Math.abs(data.demandTrend)}% vs yesterday`}
            {!trendUp && !trendDown && 'Stable vs yesterday'}
          </span>
        }
      />
    </div>
  );
}
