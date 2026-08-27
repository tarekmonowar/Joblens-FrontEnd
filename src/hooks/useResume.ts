'use client';

// Resume hooks — upload/get/delete my resume + AI customization per job.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as resumeApi from '@/lib/api/resumeApi';
import { queryKeys } from '@/lib/queryClient';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

/** My uploaded resume (null when none). Only runs for logged-in users. */
export function useMyResume() {
  const status = useAuthStore((s) => s.status);

  return useQuery({
    queryKey: queryKeys.resume(),
    queryFn: () => resumeApi.getMyResume(),
    enabled: status === 'authed',
  });
}

/** Upload or replace my resume file. */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => resumeApi.uploadResume(file),
    onSuccess: () => {
      toast.success('Resume uploaded');
      void queryClient.invalidateQueries({ queryKey: queryKeys.resume() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not upload resume'));
    },
  });
}

/** Delete my uploaded resume. */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeApi.deleteResume(),
    onSuccess: () => {
      toast.success('Resume removed');
      void queryClient.invalidateQueries({ queryKey: queryKeys.resume() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Could not remove resume'));
    },
  });
}

/** Ask AI to tailor my resume for one job. Caller handles success/error UI. */
export function useCustomizeResume() {
  return useMutation({
    mutationFn: (jobId: string) => resumeApi.customizeResume(jobId),
  });
}
