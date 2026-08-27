'use client';

// Profile section — upload one resume; AI tailors it per job on job pages.

import { useRef } from 'react';
import { FileText, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteResume, useMyResume, useUploadResume } from '@/hooks/useResume';

/**
 * Upload / replace / remove the user's resume (PDF or TXT).
 * The stored resume powers the "Customize resume" button on job pages.
 */
export function ResumeUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: resume, isLoading } = useMyResume();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    // Reset so choosing the same file again still triggers onChange.
    event.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Resume for AI customization
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your resume once — on any job page, AI rewrites it to fit that
          specific role, ready to download.
        </p>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload resume file"
        />

        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-lg" />
        ) : resume ? (
          <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{resume.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading…' : 'Replace'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-60"
          >
            <UploadCloud className="size-8 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">
              {uploadMutation.isPending ? 'Uploading…' : 'Click to upload your resume'}
            </span>
            <span className="text-xs text-muted-foreground">PDF or TXT, up to 5 MB</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
