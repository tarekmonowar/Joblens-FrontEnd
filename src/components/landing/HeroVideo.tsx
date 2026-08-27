'use client';

// Full-screen video section — text overlay + live market stats on glass cards.

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverview } from '@/hooks/useAnalytics';

const VIDEO_SRC =
  'https://pub-f4ea9af7099d4da88120f0165b8c6102.r2.dev/bgvideo%20(1).mp4';

type VideoStatProps = {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  /** Tailwind classes for the icon chip (per-stat accent color). */
  accent: string;
  /** Stagger position for the entrance animation. */
  index: number;
};

/** Frosted-glass stat card designed to sit on top of the video. */
function VideoStat({ icon, label, value, sub, accent, index }: VideoStatProps) {
  return (
    <motion.div
      className="group flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-lg backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/15 sm:p-6"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 + index * 0.15 }}
      whileHover={{ y: -6 }}
    >
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/20 transition-transform duration-300 group-hover:scale-110 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-white/85">{label}</p>
        {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
      </div>
    </motion.div>
  );
}

/**
 * Full-screen muted loop video with a centered text overlay and the three
 * live overview stats (active jobs, hiring companies, demand index) below it.
 */
export function HeroVideo() {
  const { data, isLoading } = useOverview();

  const trendLabel =
    data === undefined
      ? undefined
      : data.demandTrend > 0
        ? `↑ ${data.demandTrend}% vs yesterday`
        : data.demandTrend < 0
          ? `↓ ${Math.abs(data.demandTrend)}% vs yesterday`
          : 'Stable vs yesterday';

  return (
    <section
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
      aria-label="Live market overview"
    >
      {/* Background video + readability overlays */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/bg.jpg"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 text-center sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
            Live market pulse
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The developer market, measured in real time
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Every number below updates live as new roles are ingested, deduplicated, and
            analyzed — no stale reports, no guesswork.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {isLoading || !data ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-white/10" />
            ))
          ) : (
            <>
              <VideoStat
                index={0}
                icon={<Briefcase className="size-5" aria-hidden />}
                label="Active developer jobs"
                value={data.totalActiveJobs.toLocaleString()}
                sub={`${data.newJobsToday} new today`}
                accent="bg-sky-400/20 text-sky-300"
              />
              <VideoStat
                index={1}
                icon={<Building2 className="size-5" aria-hidden />}
                label="Companies hiring"
                value={data.companiesHiringThisMonth.toLocaleString()}
                sub="This month"
                accent="bg-emerald-400/20 text-emerald-300"
              />
              <VideoStat
                index={2}
                icon={<TrendingUp className="size-5" aria-hidden />}
                label="Market demand index"
                value={`${Math.round(data.demandIndex)}`}
                sub={trendLabel}
                accent="bg-amber-400/20 text-amber-300"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
