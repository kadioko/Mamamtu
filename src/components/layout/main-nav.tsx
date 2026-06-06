'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MenuBar } from '@/components/ui/glow-menu';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BookOpen, Calendar, Heart, LayoutDashboard, Menu, Shield, Users, X } from 'lucide-react';
import { useState } from 'react';

export function MainNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const isLoading = status === 'loading';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      gradient: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(37,99,235,0.1) 50%, rgba(29,78,216,0) 100%)',
      iconColor: 'text-blue-500',
    },
    {
      href: '/appointments',
      label: t('nav.appointments'),
      icon: Calendar,
      gradient: 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(147,51,234,0.08) 50%, rgba(126,34,206,0) 100%)',
      iconColor: 'text-violet-500',
    },
    {
      href: '/dashboard/patients',
      label: t('nav.patients'),
      icon: Users,
      gradient: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(219,39,119,0.08) 50%, rgba(190,24,93,0) 100%)',
      iconColor: 'text-pink-500',
    },
    {
      href: '/education',
      label: t('nav.education'),
      icon: BookOpen,
      gradient: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.08) 50%, rgba(21,128,61,0) 100%)',
      iconColor: 'text-green-500',
    },
  ];

  const desktopMenuItems = session?.user.role === 'ADMIN'
    ? [
        ...navLinks,
        {
          href: '/admin',
          label: t('nav.admin'),
          icon: Shield,
          gradient: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.08) 50%, rgba(194,65,12,0) 100%)',
          iconColor: 'text-orange-500',
        },
      ]
    : navLinks;
  const activeDesktopItem = desktopMenuItems.find((link) => pathname === link.href || pathname.startsWith(link.href + '/'))?.label;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MamaMtu</span>
          </Link>
          <div className="hidden md:block">
            <MenuBar items={desktopMenuItems} activeItem={activeDesktopItem} className="shadow-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          
          {session && <NotificationBell />}
          
          {isLoading ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : session ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {session.user.name || session.user.email}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm">
                  {t('nav.signOut')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={'/auth/signin' as any}>{t('nav.signIn')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={'/auth/register' as any}>{t('nav.getStarted')}</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t('nav.toggleMenu')}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background/80 backdrop-blur-xl md:hidden">
          <div className="container py-4">
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-background/95 via-background/80 to-background/60 p-3 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-4 top-0 h-24 rounded-full bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),rgba(168,85,247,0.12)_40%,rgba(244,63,94,0.08)_70%,transparent_85%)] blur-2xl" />
              <nav className="relative z-10 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'border-border/70 bg-background/75 text-foreground shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)]'
                    : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-background/55 hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300',
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'opacity-100' : 'group-hover:opacity-100'
                  )}
                  style={{ background: link.gradient }}
                />
                <div className="relative z-10 flex items-center gap-3">
                  <link.icon className={cn('h-5 w-5 transition-colors duration-300', pathname === link.href || pathname.startsWith(link.href + '/') ? link.iconColor : 'text-foreground/80')} />
                  <span>{link.label}</span>
                </div>
              </Link>
            ))}
            
            {!session && (
              <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
                <Button variant="outline" asChild>
                  <Link href={'/auth/signin' as any} onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={'/auth/register' as any} onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.getStarted')}
                  </Link>
                </Button>
              </div>
            )}
            
            {session && (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 p-4 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <p className="mb-2 text-sm text-muted-foreground">
                  {t('nav.signedInAs')} {session.user.name || session.user.email}
                </p>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="outline" className="w-full rounded-xl">
                    {t('nav.signOut')}
                  </Button>
                </form>
              </div>
            )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
