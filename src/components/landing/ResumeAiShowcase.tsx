'use client';

// Landing showcase — AI resume tailoring (upload once, customize per job).

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Upload once',
    description: 'Add your existing resume (PDF or TXT) to your profile — one time only.',
  },
  {
    icon: Wand2,
    title: 'AI matches the job',
    description:
      'On any job page, one click rewrites your title, summary, and keywords to fit that exact role.',
  },
  {
    icon: Download,
    title: 'Download & apply',
    description:
      'Preview the tailored copy and download it instantly — a unique resume for every application.',
  },
] as const;

/** Mock resume card used in the before/after visual. */
function MockResume({
  label,
  headline,
  highlight,
  skills,
}: {
  label: string;
  headline: string;
  highlight: boolean;
  skills: { name: string; matched: boolean }[];
}) {
  return (
    <div
      className={`w-full rounded-xl border bg-card p-4 shadow-sm ${
        highlight ? 'border-primary/40 ring-1 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {highlight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="size-2.5" aria-hidden />
            Tailored
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" aria-hidden />
        </div>
        <p className={`text-sm font-semibold ${highlight ? 'text-primary' : ''}`}>
          {headline}
        </p>
      </div>
      <div className="mt-3 space-y-1.5" aria-hidden>
        <div className="h-1.5 w-11/12 rounded-full bg-muted" />
        <div className="h-1.5 w-4/5 rounded-full bg-muted" />
        <div className="h-1.5 w-2/3 rounded-full bg-muted" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill.name}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              skill.matched
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two-column feature spotlight: copy + steps on the left, an animated
 * before/after resume transformation on the right.
 */
export function ResumeAiShowcase() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-3 py-16 sm:px-4 sm:py-20 lg:grid-cols-2 lg:gap-12">
        {/* Copy + steps */}
        <motion.div
          className="w-full min-w-0"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            New · AI-powered
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            One resume, tailored for every job
          </h2>
          <p className="mt-3 text-muted-foreground">
            Stop sending the same generic resume everywhere. Upload it once, and on
            any job page AI makes small, honest edits — title, summary, keywords —
            so it fits that exact role.
          </p>

          <div className="mt-8 space-y-5">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                className="flex gap-4"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 + i * 0.12 }}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <Button asChild className="gap-2">
              <Link href="/profile">
                Upload your resume
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Before → after visual */}
        <motion.div
          className="flex w-full min-w-0 flex-col items-stretch gap-3"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <MockResume
            label="Your resume"
            headline="Full-Stack Developer"
            highlight={false}
            skills={[
              { name: 'React', matched: false },
              { name: 'Node.js', matched: false },
              { name: 'TypeScript', matched: false },
              { name: 'MongoDB', matched: false },
            ]}
          />

          <motion.div
            className="flex items-center justify-center gap-2 py-1 text-sm font-medium text-primary"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <Sparkles className="size-4" />
            AI rewrite for “Senior Backend Engineer”
            <ArrowDown className="size-4" />
          </motion.div>

          <MockResume
            label="Tailored copy"
            headline="Senior Backend Engineer"
            highlight
            skills={[
              { name: 'Node.js', matched: true },
              { name: 'PostgreSQL', matched: true },
              { name: 'TypeScript', matched: true },
              { name: 'REST APIs', matched: true },
            ]}
          />
        </motion.div>
      </div>
    </section>
  );
}
