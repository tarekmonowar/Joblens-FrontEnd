'use client';

// Verify-email page — activates the account using the token from the registration email.

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/hooks/useAuth';

type VerifyState = 'loading' | 'success' | 'error' | 'missing';

/** Runs verifyEmail once on mount when a token is present in the URL. */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'missing');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    void verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token, verifyEmail]);

  if (state === 'loading') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <CardTitle className="mt-4">Verifying your email</CardTitle>
          <CardDescription>Please wait a moment…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your account is active. Sign in to browse jobs, save listings, and set alerts.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-6 text-destructive" />
          </div>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>
            This link may be expired or already used. Try registering again or contact
            support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center gap-2">
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle>Missing verification token</CardTitle>
        <CardDescription>
          Open the verification link from your email, or register a new account.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center gap-2">
        <Button asChild>
          <Link href="/register">Register</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/** Verify-email route — Suspense boundary required for useSearchParams. */
export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader>
              <Skeleton className="mx-auto h-10 w-10 rounded-full" />
              <Skeleton className="mt-4 h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
