'use client';

// Site footer — brand column, link columns, and developer credit bar.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { env } from '@/config/runtime';
import { useAuthStore } from '@/store/authStore';

// Brand icons — lucide-react removed Github/Linkedin, so these are inline SVGs.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.04 11.04 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]);

const DEVELOPER = {
  name: 'Tarek Monowar',
  github: 'https://github.com/tarekmonowar',
  linkedin: 'https://www.linkedin.com/in/tarekmonowar/',
  email: 'tarekmonowar353@gmail.com',
} as const;

const LINK_COLUMNS = [
  {
    heading: 'Platform',
    requiresAuth: false,
    links: [
      { label: 'Browse jobs', href: '/jobs' },
      { label: 'Market analytics', href: '/analytics' },
      { label: 'Advanced search', href: '/search' },
    ],
  },
  {
    heading: 'Your account',
    requiresAuth: true,
    links: [
      { label: 'Saved jobs', href: '/saved' },
      { label: 'Applied jobs', href: '/jobs/applied' },
      { label: 'Job alerts', href: '/alerts' },
    ],
  },
  {
    heading: 'Get started',
    requiresAuth: false,
    links: [
      { label: 'Create free account', href: '/register' },
      { label: 'Log in', href: '/login' },
      { label: 'Profile', href: '/profile' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: DEVELOPER.github,
    icon: GithubIcon,
  },
  {
    label: 'LinkedIn',
    href: DEVELOPER.linkedin,
    icon: LinkedinIcon,
  },
  {
    label: 'Email',
    href: `mailto:${DEVELOPER.email}`,
    icon: Mail,
  },
] as const;

/** Site footer — hidden on auth pages (login, register, forgot, reset). */
export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);

  if (AUTH_PATHS.has(pathname)) {
    return null;
  }

  const year = new Date().getFullYear();

  /** Guests clicking account links get a toast and land on the login page. */
  const handleProtectedClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (authStatus === 'authed') return;
    event.preventDefault();
    toast.error('Please login first');
    router.push(`/login?next=${encodeURIComponent(href)}`);
  };

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-primary/20 bg-linear-to-br from-primary/22 via-background to-primary/10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 size-72 rounded-full bg-primary/20 blur-3xl" />
      </div>

      {/* Top: brand + link columns */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4">
          <p className="text-lg font-bold tracking-tight">{env.appName}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Real-time job-market intelligence for Bangladesh&apos;s software developers —
            aggregated from LinkedIn, Indeed, Glassdoor, and more, deduplicated and
            analyzed live.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-background/70 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <nav
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 lg:col-span-8"
          aria-label="Footer navigation"
        >
          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-sm font-semibold">{column.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={
                        column.requiresAuth
                          ? (e) => handleProtectedClick(e, link.href)
                          : undefined
                      }
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom: copyright + developer credit */}
      <div className="relative border-t border-primary/15 bg-primary/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {year} {env.appName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed &amp; built by{' '}
            <a
              href={DEVELOPER.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
