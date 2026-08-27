'use client';

// Profile page — career form, match score, and personalized job recommendations.

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ResumeUpload } from '@/components/profile/ResumeUpload';
import { MatchScore } from '@/components/profile/MatchScore';
import { RecommendedJobs } from '@/components/profile/RecommendedJobs';

/** Auth-required profile — edit skills, view match %, see recommended jobs. */
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Your profile</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Keep your skills up to date for better match scores and job recommendations.
        </p>

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
      </div>
    </ProtectedRoute>
  );
}
