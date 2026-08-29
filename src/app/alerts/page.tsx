'use client';

// Job alerts page — create (left) and manage (right) side by side.

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { AlertForm } from '@/components/alerts/AlertForm';
import { AlertList } from '@/components/alerts/AlertList';
import { Skeleton } from '@/components/ui/skeleton';
import { BellRing, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

function AlertsPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BellRing className="size-6" aria-hidden />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" aria-hidden />
                Automated discovery
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Job alerts</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Create focused searches and get notified when a new role matches your criteria.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            Refine once. Get matched automatically.
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function AlertsPageSkeleton() {
  return (
    <AlertsPageFrame>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-53 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </AlertsPageFrame>
  );
}

/** Auth-required alerts management — create, edit, toggle, test, preview, delete. */
export default function AlertsPage() {
  return (
    <ProtectedRoute fallback={<AlertsPageSkeleton />}>
      <AlertsPageFrame>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-24">
            <AlertForm />
          </div>
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Monitoring
                </p>
                <h2 className="mt-1 text-xl font-semibold">Your alerts</h2>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Pause, edit, or test delivery anytime
              </p>
            </div>
            <AlertList />
          </div>
        </div>
      </AlertsPageFrame>
    </ProtectedRoute>
  );
}
