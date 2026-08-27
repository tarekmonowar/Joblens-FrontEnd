// React Query client config + centralized query key factory.

import { QueryClient } from '@tanstack/react-query';
import type { AnalyticsRange } from '@/types/analytics';
import type { JobFilters } from '@/types/job';

/** Default query client — 60s stale time, single retry, no refetch on focus. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Stable query keys for cache invalidation across hooks and mutations. */
export const queryKeys = {
  jobs: (filters: JobFilters) => ['jobs', filters] as const,
  job: (id: string) => ['job', id] as const,
  trending: () => ['trending'] as const,
  similar: (id: string) => ['similar', id] as const,
  search: (q: string) => ['search', q] as const,
  saved: () => ['saved'] as const,
  applied: () => ['applied'] as const,
  alerts: () => ['alerts'] as const,
  analytics: {
    overview: () => ['an', 'overview'] as const,
    skills: (params: { range: AnalyticsRange; skills?: string[] }) =>
      ['an', 'skills', params] as const,
    companies: (limit?: number) => ['an', 'companies', limit] as const,
    salaries: (params: { currency: string; experience?: number }) =>
      ['an', 'salaries', params] as const,
    locations: () => ['an', 'locations'] as const,
    timeline: (range: AnalyticsRange) => ['an', 'timeline', range] as const,
    demandIndex: () => ['an', 'demandIndex'] as const,
  },
  me: () => ['me'] as const,
  resume: () => ['resume'] as const,
  matchScore: () => ['matchScore'] as const,
  recommendations: () => ['recs'] as const,
  admin: {
    stats: () => ['admin', 'stats'] as const,
    fetchLogs: (page: number) => ['admin', 'fetchLogs', page] as const,
    queues: () => ['admin', 'queues'] as const,
    users: (page: number) => ['admin', 'users', page] as const,
  },
};
