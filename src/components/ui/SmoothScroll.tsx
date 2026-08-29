'use client';

// Official Lenis window scroller — https://github.com/darkroomengineering/lenis

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';
import type { LenisOptions } from 'lenis';

/** Official no-code defaults: nested scroll, anchors, route inertia, reduced motion. */
const OPTIONS: LenisOptions = {
  autoRaf: true,
  autoToggle: true,
  anchors: true,
  allowNestedScroll: true,
  naiveDimensions: true,
  stopInertiaOnNavigate: true,
};

function ResetScrollOnRoute() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || window.location.hash) return;
    lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}

/**
 * Mounts a root Lenis instance on `window` so native scroll stays intact
 * (sticky, skip links, mobile touch). `syncTouch` stays off — official docs
 * flag it as unstable on iOS < 16; phones keep native momentum instead.
 */
export function SmoothScroll() {
  return (
    <ReactLenis root options={OPTIONS}>
      <ResetScrollOnRoute />
    </ReactLenis>
  );
}
