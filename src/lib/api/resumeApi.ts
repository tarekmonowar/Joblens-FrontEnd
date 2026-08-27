// Resume API — upload once, then AI-customize for any job.

import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { CustomizedResumeDto, ResumeDto } from '@/types/resume';

/** Upload (or replace) my resume file (PDF or TXT). */
export async function uploadResume(file: File): Promise<ResumeDto> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<ApiResponse<ResumeDto>>('/resume/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

/** Fetch my uploaded resume, or null when none exists. */
export async function getMyResume(): Promise<ResumeDto | null> {
  const res = await api.get<ApiResponse<ResumeDto | null>>('/resume/me');
  return res.data.data;
}

/** Delete my uploaded resume. */
export async function deleteResume(): Promise<void> {
  await api.delete('/resume/me');
}

/** Ask AI to rewrite my resume so it fits one specific job (returns a PDF). */
export async function customizeResume(jobId: string): Promise<CustomizedResumeDto> {
  const res = await api.post<ApiResponse<CustomizedResumeDto>>(
    `/resume/customize/${jobId}`,
    undefined,
    // The pipeline makes multiple AI calls — allow up to 3 minutes.
    { timeout: 180_000 },
  );
  return res.data.data;
}
