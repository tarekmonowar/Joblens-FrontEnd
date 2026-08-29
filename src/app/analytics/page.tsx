'use client';

// Analytics dashboard — each chart owns its data fetch + loading/error state.

import { OverviewCards } from '@/components/analytics/OverviewCards';
import { SkillTrendsChart } from '@/components/analytics/SkillTrendsChart';
import { TopCompaniesChart } from '@/components/analytics/TopCompaniesChart';
import { SalaryChart } from '@/components/analytics/SalaryChart';
import { LocationMap } from '@/components/analytics/LocationMap';
import { JobTypeDonut } from '@/components/analytics/JobTypeDonut';
import { TimelineChart } from '@/components/analytics/TimelineChart';
import { DemandGauge } from '@/components/analytics/DemandGauge';
import { SkillsCloud } from '@/components/analytics/SkillsCloud';
import { RisingDecliningSkills } from '@/components/analytics/RisingDecliningSkills';

/**
 * Premium analytics dashboard — overview row plus an isolated chart grid.
 * Public route; every widget fetches its own endpoint via useAnalytics hooks.
 */
export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Market analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Bangladesh developer job market intelligence — updated daily from multiple sources
        </p>
      </div>

      <div className="space-y-6">
        <OverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <SkillTrendsChart />
          <TimelineChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TopCompaniesChart />
          <SalaryChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <LocationMap />
          <JobTypeDonut />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DemandGauge />
          <SkillsCloud />
        </div>

        <RisingDecliningSkills />
      </div>
    </div>
  );
}
