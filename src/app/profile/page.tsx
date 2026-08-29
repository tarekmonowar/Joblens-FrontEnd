'use client';

// Profile page — career form, match score, and personalized job recommendations.

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ResumeUpload } from '@/components/profile/ResumeUpload';
import { MatchScore } from '@/components/profile/MatchScore';
import { RecommendedJobs } from '@/components/profile/RecommendedJobs';
import { JobCardSkeleton } from '@/components/ui/content-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

function ProfilePageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserRound className="size-6" aria-hidden />
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Target className="size-3.5" aria-hidden />
            Career preferences
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Your profile</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Keep your experience and goals current to improve match scores and recommendations.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <ProfilePageFrame>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <div className="space-y-5 rounded-xl border bg-card p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-28" />
          </div>
          <Skeleton className="h-47.5 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mx-auto mt-8 size-35 rounded-full" />
          <Skeleton className="mx-auto mt-5 h-4 w-44" />
        </div>
      </div>
    </ProfilePageFrame>
  );
}

/** Auth-required profile — edit skills, view match %, see recommended jobs. */
export default function ProfilePage() {
  return (
    <ProtectedRoute fallback={<ProfilePageSkeleton />}>
      <ProfilePageFrame>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-8">
            <ProfileForm />
            <ResumeUpload />
            <RecommendedJobs />
          </div>
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <MatchScore />
          </aside>
        </div>
      </ProfilePageFrame>
    </ProtectedRoute>
  );
}
