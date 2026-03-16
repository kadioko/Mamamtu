'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Heart,
  Activity,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(37,99,235,0.1) 55%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
    gradient: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, rgba(219,39,119,0.08) 55%, rgba(190,24,93,0) 100%)',
    iconColor: 'text-pink-500',
  },
  {
    title: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
    gradient: 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(147,51,234,0.08) 55%, rgba(126,34,206,0) 100%)',
    iconColor: 'text-violet-500',
  },
  {
    title: 'Medical Records',
    href: '/dashboard/records',
    icon: FileText,
    gradient: 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, rgba(2,132,199,0.08) 55%, rgba(3,105,161,0) 100%)',
    iconColor: 'text-sky-500',
  },
  {
    title: 'Vitals',
    href: '/dashboard/vitals',
    icon: Activity,
    gradient: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.08) 55%, rgba(185,28,28,0) 100%)',
    iconColor: 'text-red-500',
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: ClipboardList,
    gradient: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(217,119,6,0.08) 55%, rgba(180,83,9,0) 100%)',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Education',
    href: '/dashboard/education',
    icon: BookOpen,
    gradient: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.08) 55%, rgba(21,128,61,0) 100%)',
    iconColor: 'text-green-500',
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    gradient: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(234,88,12,0.08) 55%, rgba(194,65,12,0) 100%)',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.08) 55%, rgba(67,56,202,0) 100%)',
    iconColor: 'text-indigo-500',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    const main = document.getElementById('dashboard-main');
    if (main) {
      main.classList.toggle('lg:ml-16', next);
      main.classList.toggle('lg:ml-64', !next);
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r border-border/60 bg-gradient-to-b from-background/95 via-background/85 to-background/70 backdrop-blur-xl transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="absolute inset-x-2 top-2 h-24 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),rgba(168,85,247,0.08)_45%,transparent_80%)] blur-2xl" />
      <div className="relative flex h-full flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mb-4 px-3">
            <div className={cn('rounded-2xl border border-border/60 bg-background/50 p-3 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl', isCollapsed && 'flex justify-center px-2')}>
              {isCollapsed ? (
                <Sparkles className="h-4 w-4 text-primary" />
              ) : (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Care workspace</p>
                  <p className="text-sm font-medium text-foreground">Maternal health operations</p>
                </div>
              )}
            </div>
          </div>
          <nav className="space-y-2 px-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="block"
                  title={isCollapsed ? item.title : undefined}
                >
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all duration-300',
                      isCollapsed ? 'flex justify-center' : 'flex items-center gap-3',
                      isActive
                        ? 'border-border/70 bg-background/70 text-foreground shadow-[0_10px_24px_-18px_rgba(0,0,0,0.5)] backdrop-blur-xl'
                        : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-background/55 hover:text-foreground hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)]'
                    )}
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300',
                        isActive ? 'opacity-100' : 'group-hover:opacity-100'
                      )}
                      style={{ background: item.gradient }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-colors duration-300', isActive ? item.iconColor : 'text-foreground/80')} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border/60 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl border border-border/50 bg-background/40 backdrop-blur-xl hover:bg-background/70"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="border-t border-border/60 p-4">
            <div className="rounded-2xl border border-border/60 bg-background/45 px-3 py-3 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3 text-primary" />
                <span>MamaMtu v1.0</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground/90">
                A calmer dashboard for scheduling, monitoring, and patient follow-up.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
