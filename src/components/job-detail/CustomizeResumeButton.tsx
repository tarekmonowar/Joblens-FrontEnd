'use client';

// AI resume tailoring CTA — opens a progress dialog, then shows the PDF.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Download, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCustomizeResume } from '@/hooks/useResume';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { CustomizedResumeDto } from '@/types/resume';

type CustomizeResumeButtonProps = {
  jobId: string;
};

/** Pipeline stages shown while the backend works (mirrors the real flow). */
const STAGES = [
  'Reading your resume',
  'Calling AI',
  'Tailoring it for this job',
  'Validating the changes',
  'Generating your PDF',
] as const;

/** Seconds spent on each stage before advancing to the next label. */
const STAGE_SECONDS = [2, 4, 8, 6, 4];

/** Convert the base64 PDF from the API into a browser object URL. */
function pdfToObjectUrl(pdfBase64: string): string {
  const bytes = atob(pdfBase64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  const blob = new Blob([array], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/** Vertical list of pipeline stages with done / running / waiting states. */
function StageList({ currentStage }: { currentStage: number }) {
  return (
    <div className="mx-auto w-full max-w-xs space-y-3 py-2">
      {STAGES.map((label, i) => {
        const isDone = i < currentStage;
        const isCurrent = i === currentStage;
        return (
          <div
            key={label}
            className={`flex items-center gap-3 text-sm transition-colors ${
              isDone
                ? 'text-muted-foreground'
                : isCurrent
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            {isDone ? (
              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
            ) : isCurrent ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
            ) : (
              <Circle className="size-4 shrink-0" aria-hidden />
            )}
            {label}
            {isCurrent && <span className="animate-pulse">…</span>}
          </div>
        );
      })}
    </div>
  );
}

/**
 * "Customize resume" — opens the dialog immediately with live pipeline
 * progress, then swaps to a PDF preview with a download button.
 */
export function CustomizeResumeButton({ jobId }: CustomizeResumeButtonProps) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const customizeMutation = useCustomizeResume();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<CustomizedResumeDto | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const isWorking = customizeMutation.isPending;

  // Advance the stage label on a timer while the request runs
  // (one backend call — the stages give the user a clear sense of progress).
  useEffect(() => {
    if (!isWorking) return;
    if (stage >= STAGES.length - 1) return;

    const timer = setTimeout(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      STAGE_SECONDS[stage] * 1000,
    );
    return () => clearTimeout(timer);
  }, [isWorking, stage]);

  const closeDialog = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setResult(null);
    setOpen(false);
    setStage(0);
  };

  const handleClick = () => {
    if (status === 'idle') return;

    if (status === 'guest') {
      toast.error('Sign in to customize your resume');
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Open the dialog right away so the user sees progress from second one.
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setStage(0);
    setResult(null);
    setOpen(true);

    customizeMutation.mutate(jobId, {
      onSuccess: (data) => {
        setResult(data);
        setPdfUrl(pdfToObjectUrl(data.pdfBase64));
      },
      onError: (error) => {
        setOpen(false);
        setStage(0);
        const message = getApiErrorMessage(error, 'Could not customize resume');
        toast.error(message);
        // No resume uploaded yet → send the user to the profile upload section.
        if (message.toLowerCase().includes('no resume')) {
          router.push('/profile');
        }
      },
    });
  };

  const handleDownload = () => {
    if (!result || !pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = result.fileName;
    link.click();
    toast.success('Resume downloaded');
  };

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={handleClick}
        disabled={isWorking || status === 'idle'}
        className="gap-2 border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
      >
        {isWorking ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Customizing…
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden />
            Customize resume
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && closeDialog()}>
        <DialogContent className="sm:max-w-3xl">
          {result === null ? (
            /* ── Working state: live pipeline progress ── */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-pulse text-primary" aria-hidden />
                  Customizing your resume
                </DialogTitle>
                <DialogDescription>
                  AI is making small honest edits — title, summary, and keyword
                  emphasis — so your resume fits this role. Usually takes under a
                  minute.
                </DialogDescription>
              </DialogHeader>
              <StageList currentStage={stage} />
            </>
          ) : (
            /* ── Done state: PDF preview + download ── */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden />
                  Your resume, tailored for this job
                </DialogTitle>
                <DialogDescription>
                  Review the PDF, then download it and apply with confidence.
                </DialogDescription>
              </DialogHeader>

              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="Tailored resume preview"
                  className="h-[55vh] w-full rounded-lg border bg-muted/40"
                />
              )}

              <DialogFooter showCloseButton>
                <Button className="gap-2" onClick={handleDownload}>
                  <Download className="size-4" aria-hidden />
                  Download PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
