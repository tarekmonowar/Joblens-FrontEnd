'use client';

// Top navigation — floating production bar, logo, pill links, auth actions.

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X, User, LogOut, Briefcase, Bookmark, Bell, Shield, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { env } from '@/config/runtime';
import { useAuthStore } from '@/store/authStore';

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]);

/** Silver bar + a slight primary wash per route (hex so Motion can interpolate). */
const NAV_BG = {
  home: '#d4d4d8',
  jobs: '#c7d0e6',
  analytics: '#b9c6e8',
  search: '#c3cce4',
  saved: '#c9c6e6',
  alerts: '#c4d2e8',
  other: '#c8cde4',
} as const;

function barColor(pathname: string): string {
  if (pathname === '/' || AUTH_PATHS.has(pathname)) return NAV_BG.home;
  if (pathname.startsWith('/jobs')) return NAV_BG.jobs;
  if (pathname.startsWith('/analytics')) return NAV_BG.analytics;
  if (pathname.startsWith('/search')) return NAV_BG.search;
  if (pathname.startsWith('/saved')) return NAV_BG.saved;
  if (pathname.startsWith('/alerts')) return NAV_BG.alerts;
  return NAV_BG.other;
}

type NavLink = { href: string; label: string; auth?: boolean };

const NAV_LINKS: NavLink[] = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/search', label: 'Search' },
  { href: '/saved', label: 'Saved', auth: true },
  { href: '/alerts', label: 'Alerts', auth: true },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function linkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Site header with primary nav and auth-aware actions. */
export function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, status, logout } = useAuthStore();
  const isAuthed = status === 'authed' && user !== null;
  const isGuest = !isAuthed;

  const overlay = pathname === '/' || AUTH_PATHS.has(pathname);
  const bg = barColor(pathname);

  const visibleLinks = NAV_LINKS.filter((link) => !link.auth || isAuthed);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    setMobileOpen(false);
  };

  const signInHref =
    pathname && pathname !== '/login'
      ? `/login?next=${encodeURIComponent(pathname)}`
      : '/login';

  const colorTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 32 };

  return (
    <header
      className={cn(
        'z-50',
        overlay ? 'pointer-events-none fixed inset-x-0 top-0' : 'sticky top-0',
      )}
    >
      <div className="pointer-events-auto mx-auto max-w-7xl px-3 pt-3 sm:px-4">
        <motion.div
          className="overflow-hidden rounded-2xl border border-black/10 shadow-lg"
          initial={false}
          animate={{ backgroundColor: bg }}
          transition={colorTransition}
        >
          <div className="flex h-14 items-center gap-3 px-3 sm:h-16 sm:px-4">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 focus-visible:rounded-md"
            >
              <Image
                src="/favicon.png"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full"
                priority
              />
              <span className="text-[15px] font-bold tracking-tight text-zinc-950 sm:text-base">
                {env.appName}
              </span>
            </Link>

            <nav
              className="hidden flex-1 justify-center md:flex"
              aria-label="Main navigation"
            >
              <div className="flex items-center rounded-full border border-black/5 bg-white p-1">
                {visibleLinks.map((link) => {
                  const active = linkActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'relative rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-3.5 lg:text-sm',
                        active ? 'text-primary' : 'text-zinc-600 hover:text-zinc-950',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-full bg-primary/15"
                          transition={pillTransition}
                          aria-hidden
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              {isAuthed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden h-9 gap-2 rounded-full border border-black/10 bg-white px-1.5 pr-3 text-zinc-950 hover:bg-white hover:text-zinc-950 md:inline-flex"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {initials(user.name)}
                      </span>
                      <span className="max-w-30 truncate text-sm font-medium">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 size-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs/applied" className="cursor-pointer">
                        <Briefcase className="mr-2 size-4" />
                        Applied
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved" className="cursor-pointer">
                        <Bookmark className="mr-2 size-4" />
                        Saved
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/alerts" className="cursor-pointer">
                        <Bell className="mr-2 size-4" />
                        Alerts
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 size-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isGuest ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden rounded-full font-medium text-zinc-800 hover:bg-white hover:text-zinc-950 sm:inline-flex"
                    asChild
                  >
                    <Link href={signInHref}>Sign in</Link>
                  </Button>
                  <Button size="sm" className="hidden rounded-full px-4 sm:inline-flex" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                  <Button size="sm" className="rounded-full sm:hidden" asChild>
                    <Link href={signInHref}>
                      <LogIn className="size-4" />
                      Sign in
                    </Link>
                  </Button>
                </>
              ) : null}

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-zinc-950 hover:bg-white hover:text-zinc-950 md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {mobileOpen && (
            <nav
              id="mobile-nav"
              className="border-t border-black/10 px-3 py-3 md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-1">
                {visibleLinks.map((link) => {
                  const active = linkActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-xl px-3 py-2.5 text-sm font-medium',
                        active
                          ? 'bg-primary/15 font-semibold text-primary'
                          : 'text-zinc-700 hover:bg-white hover:text-zinc-950',
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-2 flex flex-col gap-2 border-t border-black/10 pt-3">
                  {isAuthed ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-white"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/jobs/applied"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-white"
                      >
                        Applied
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-xl px-3 py-2 text-sm text-zinc-800 hover:bg-white"
                        >
                          Admin
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-black/15 bg-white text-zinc-950 hover:bg-white"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : isGuest ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-black/15 bg-white text-zinc-950 hover:bg-white"
                        asChild
                      >
                        <Link href={signInHref} onClick={() => setMobileOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          Register
                        </Link>
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </nav>
          )}
        </motion.div>
      </div>
    </header>
  );
}
