// Final call-to-action band before the footer (static marketing section).

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Gradient CTA banner — last conversion push at the bottom of the landing page. */
export function CtaBanner() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center shadow-xl sm:px-12 sm:py-16">
        {/* Soft radial glows for depth */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to find your next role?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
            Join the developers using live market data to search smarter — free forever,
            no credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-2 bg-white text-primary hover:bg-white/90"
            >
              <Link href="/register">
                Create free account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
