'use client';

// Landing toolkit — market-desk blotter (product UI, not a generic icon grid).

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOverview } from '@/hooks/useAnalytics';

const LIVE_JOBS = [
  { title: 'Senior Frontend Engineer', company: 'Pathao', meta: 'Dhaka · Hybrid', ago: '2m' },
  { title: 'Backend Engineer', company: 'bKash', meta: 'Remote · Full-time', ago: '11m' },
  { title: 'DevOps Engineer', company: 'Brain Station 23', meta: 'Dhaka · Onsite', ago: '28m' },
] as const;

const FILTER_CHIPS = [
  { label: 'Bangladesh', active: true },
  { label: 'Worldwide', active: false },
  { label: 'Remote', active: false },
  { label: 'Full-time', active: false },
  { label: 'React', active: false },
  { label: '৳80k+', active: false },
] as const;

const ALERT_CADENCE = ['Instant', 'Daily', 'Weekly'] as const;

const CELL =
  'group relative flex h-full min-h-0 flex-col px-6 py-6 transition-colors hover:bg-muted/35 focus-visible:bg-muted/35';

function Cell({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(CELL, className)}>
      <ArrowUpRight
        className="absolute right-5 top-6 size-4 text-primary/50 transition-colors group-hover:text-primary"
        aria-hidden
      />
      {children}
    </Link>
  );
}

function IndexLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pr-8">
      <span className="font-mono text-base font-bold tabular-nums text-primary">{n}</span>
      <h3 className="text-base font-bold tracking-tight text-primary sm:text-lg">{title}</h3>
    </div>
  );
}

function Blurb({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function Visual({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-auto flex min-h-21 items-end pt-5', className)}>{children}</div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 160 36" className="h-8 w-full text-primary" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        points="0,28 18,24 32,26 48,18 64,20 80,12 96,14 112,8 128,11 144,6 160,9"
      />
    </svg>
  );
}

/** Six-capability market desk for the landing page. */
export function FeatureShowcase() {
  const { data } = useOverview();
  const openRoles = data?.totalActiveJobs;
  const demand = data ? Math.round(data.demandIndex) : undefined;

  return (
    <section className="py-16 sm:py-24" aria-labelledby="toolkit-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Toolkit · 06
          </p>
          <h2
            id="toolkit-heading"
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Everything you need to navigate the BD dev market
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            From discovery to application tracking — one platform for Bangladesh&apos;s
            software developer job hunt.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex h-11 items-center justify-between border-b bg-muted/40 px-6">
            <div className="flex items-center gap-2.5">
              <LiveDot />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Market desk
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
              BD · {openRoles != null ? `${openRoles.toLocaleString()} live` : 'Live'}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 lg:grid-rows-[minmax(13.5rem,auto)_minmax(13.5rem,auto)_minmax(14.5rem,auto)]">
            <Cell href="/jobs" className="lg:col-span-7 lg:row-span-2 lg:border-r">
              <IndexLabel n="01" title="Live job feed" />
              <Blurb>
                New roles appear in real time from multiple job boards — no manual refresh
                needed.
              </Blurb>

              <ul className="mt-auto w-full divide-y border-y">
                {LIVE_JOBS.map((job) => (
                  <li key={job.title} className="flex h-14 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{job.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {job.company}
                        <span className="mx-1.5 text-border">·</span>
                        {job.meta}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {job.ago}
                    </span>
                  </li>
                ))}
              </ul>
            </Cell>

            <Cell href="/jobs" className="border-t lg:col-span-5 lg:border-t-0">
              <IndexLabel n="02" title="Smart filters" />
              <Blurb>
                Region, work type, skills, salary, and category — Bangladesh vs worldwide
                remote.
              </Blurb>
              <Visual>
                <div className="flex w-full flex-wrap content-end gap-1.5">
                  {FILTER_CHIPS.map((chip) => (
                    <span
                      key={chip.label}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                        chip.active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground',
                      )}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              </Visual>
            </Cell>

            <Cell href="/analytics" className="border-t lg:col-span-5">
              <IndexLabel n="03" title="Market analytics" />
              <Blurb>
                Demand index, salary trends, top companies, and skill trajectories — in one
                dashboard.
              </Blurb>
              <Visual className="w-full items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-primary">
                    {demand ?? '—'}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Demand index
                  </p>
                </div>
                <div className="mb-1 w-32 shrink-0 sm:w-36">
                  <Sparkline />
                </div>
              </Visual>
            </Cell>

            <Cell href="/saved" className="border-t lg:col-span-4 lg:border-r">
              <IndexLabel n="04" title="Save & track" />
              <Blurb>Heart jobs with notes, mark applied, and export your list to CSV.</Blurb>
              <Visual>
                <div className="w-full rounded-lg border bg-muted/40 px-3 py-2.5">
                  <p className="text-xs font-semibold">Pathao · Frontend</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    Round 2 — asked about React Native. Follow up Friday.
                  </p>
                </div>
              </Visual>
            </Cell>

            <Cell href="/alerts" className="border-t lg:col-span-4 lg:border-r">
              <IndexLabel n="05" title="Job alerts" />
              <Blurb>
                Instant, daily, or weekly email when new jobs match your keywords and skills.
              </Blurb>
              <Visual>
                <div className="flex h-10 w-full overflow-hidden rounded-lg border text-[11px] font-semibold">
                  {ALERT_CADENCE.map((label, i) => (
                    <span
                      key={label}
                      className={cn(
                        'flex flex-1 items-center justify-center',
                        i === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground',
                        i > 0 && 'border-l',
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </Visual>
            </Cell>

            <Cell href="/profile" className="border-t lg:col-span-4">
              <IndexLabel n="06" title="Resume tailoring" />
              <Blurb>Upload once — on any job, copy is rewritten to fit that exact role.</Blurb>
              <Visual>
                <div className="w-full rounded-lg border bg-muted/40 px-3 py-2.5 font-mono text-[11px] leading-5">
                  <p className="text-muted-foreground line-through decoration-muted-foreground/50">
                    Full-Stack Developer
                  </p>
                  <p className="font-semibold text-primary">Senior Backend Engineer</p>
                </div>
              </Visual>
            </Cell>
          </div>
        </div>
      </div>
    </section>
  );
}
