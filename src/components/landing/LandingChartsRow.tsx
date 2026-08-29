'use client';

// Landing preview — skill trends + salaries by role (same charts as /analytics).

import Link from 'next/link';
import { SkillTrendsChart } from '@/components/analytics/SkillTrendsChart';
import { SalaryChart } from '@/components/analytics/SalaryChart';
import { Button } from '@/components/ui/button';

/**
 * Two-column chart row placed after the how-it-works pipeline on the home page.
 */
export function LandingChartsRow() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Market insights</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Skill demand trends and salary benchmarks from live developer job data
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href="/analytics">View all analytics</Link>
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="min-w-0 w-full">
            <SkillTrendsChart />
          </div>
          <div className="min-w-0 w-full">
            <SalaryChart />
          </div>
        </div>
      </div>
    </section>
  );
}
