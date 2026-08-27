'use client';

// Landing hero — live job counter (socket) + CTAs.

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverview } from '@/hooks/useAnalytics';
import { env } from '@/config/runtime';

/** Brief scale pulse when the live count changes. */
function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.08, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

/**
 * Hero section with a live active-jobs counter from analytics overview.
 * `stats:update` patches the overview cache in Providers — single source of truth.
 */
export function Hero() {
  const { data: overview, isLoading } = useOverview();
  const count = overview?.totalActiveJobs ?? 0;
  const waitingForCount = isLoading && overview === undefined;

  return (
    <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:pb-10 sm:pt-28">
      {/* Sharp full-bleed photo — no blur on the hero itself */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Blur + tint only behind the text block (glass over sharp bg) */}
        <div
          className="pointer-events-none absolute -inset-x-3 -inset-y-6 rounded-2xl bg-background/40 backdrop-blur-md sm:-inset-x-6 sm:-inset-y-8"
          aria-hidden
        />

        <div className="relative">
        {/* <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Bangladesh developer job intelligence
        </div> */}

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find your next role with <span className="text-primary">{env.appName}</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg  sm:text-xl">
          Real-time market data from LinkedIn, Indeed, Glassdoor, and more — aggregated and
          deduplicated for Bangladesh&apos;s software developer community.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2 sm:mt-8">
          {waitingForCount ? (
            <Skeleton className="h-14 w-48" />
          ) : (
            <p className="text-5xl font-bold tabular-nums text-primary sm:text-6xl">
              <AnimatedCounter value={count} />
              <span aria-hidden>+</span>
            </p>
          )}
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Active developer jobs right now
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link href="/jobs">
              Browse jobs
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Sign up free</Link>
          </Button>
        </div>
        </div>
      </motion.div>
    </section>
  );
}
