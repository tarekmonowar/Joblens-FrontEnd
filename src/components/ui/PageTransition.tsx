'use client';

// Subtle page enter animation on route change — respects prefers-reduced-motion.

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type PageTransitionProps = {
  children: ReactNode;
};

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]);

/**
 * Fades/slides main content in when the pathname changes.
 * Auth routes stretch to full height so the footer never jumps during load.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isAuth = AUTH_PATHS.has(pathname);

  const shellClass = cn('flex flex-1 flex-col', isAuth && 'min-h-dvh');

  if (reduceMotion) {
    return <div className={shellClass}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className={shellClass}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
