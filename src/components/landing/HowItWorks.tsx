// "How it works" — 4-step pipeline + source badges (static marketing section).

import { DatabaseZap, ScanSearch, Send, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: DatabaseZap,
    step: '01',
    title: 'Aggregate',
    description:
      'Developer roles are continuously ingested from LinkedIn, Indeed, Glassdoor, BDJobs, and more — around the clock, no manual refresh.',
  },
  {
    icon: ScanSearch,
    step: '02',
    title: 'Analyze',
    description:
      'Duplicates across boards are merged into one clean listing, while skills, salaries, and demand signals are extracted in real time.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Customize resume',
    description:
      'Upload your resume once — on any job page, AI rewrites the title, summary, and keywords to fit that role, ready as a PDF.',
  },
  {
    icon: Send,
    step: '04',
    title: 'Apply',
    description:
      'Apply with your tailored resume, track every application, and get instant, daily, or weekly alerts when new matches appear.',
  },
] as const;

const SOURCES = ['LinkedIn', 'Indeed', 'Glassdoor', 'BDJobs', 'More sources'] as const;

/** Three-step pipeline explaining how job data flows through the platform. */
export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          From scattered job boards to one clear signal
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          One pipeline turns noisy postings across the web into clean, deduplicated,
          analyzed market data you can act on.
        </p>
      </div>

      <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* Connector line between steps (desktop only) */}
        <div
          className="absolute left-[12.5%] right-[12.5%] top-10 hidden border-t-2 border-dashed border-border lg:block"
          aria-hidden
        />

        {STEPS.map(({ icon: Icon, step, title, description }) => (
          <div key={step} className="relative text-center lg:px-2">
            <div className="relative mx-auto flex size-20 items-center justify-center rounded-2xl border bg-card shadow-sm">
              <Icon className="size-8 text-primary" aria-hidden />
              <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step.slice(1)}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Data source badges */}
      <div className="mt-14 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Aggregating live data from
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {SOURCES.map((source) => (
            <span
              key={source}
              className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
