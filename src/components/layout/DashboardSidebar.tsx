'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { UserRole } from '@/types/roles';
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
  Baby,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Syringe,
  UserCog,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  allowedRoles?: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    titleKey: 'sidebar.overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(37,99,235,0.1) 55%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
  },
  {
    titleKey: 'sidebar.patients',
    href: '/dashboard/patients',
    icon: Users,
    gradient: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, rgba(219,39,119,0.08) 55%, rgba(190,24,93,0) 100%)',
    iconColor: 'text-pink-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'],
  },
  {
    titleKey: 'sidebar.appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
    gradient: 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(147,51,234,0.08) 55%, rgba(126,34,206,0) 100%)',
    iconColor: 'text-violet-500',
  },
  {
    titleKey: 'sidebar.medicalRecords',
    href: '/dashboard/records',
    icon: FileText,
    gradient: 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, rgba(2,132,199,0.08) 55%, rgba(3,105,161,0) 100%)',
    iconColor: 'text-sky-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.vitals',
    href: '/dashboard/vitals',
    icon: Activity,
    gradient: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.08) 55%, rgba(185,28,28,0) 100%)',
    iconColor: 'text-red-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.pregnancies',
    href: '/dashboard/pregnancies',
    icon: Heart,
    gradient: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.08) 55%, rgba(190,18,60,0) 100%)',
    iconColor: 'text-rose-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.ancVisits',
    href: '/dashboard/antenatal',
    icon: ClipboardList,
    gradient: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, rgba(13,148,136,0.08) 55%, rgba(15,118,110,0) 100%)',
    iconColor: 'text-teal-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.newborns',
    href: '/dashboard/newborns',
    icon: Baby,
    gradient: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(14,165,233,0.08) 55%, rgba(2,132,199,0) 100%)',
    iconColor: 'text-cyan-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.immunizations',
    href: '/dashboard/immunizations',
    icon: Syringe,
    gradient: 'radial-gradient(circle, rgba(132,204,22,0.2) 0%, rgba(101,163,13,0.08) 55%, rgba(77,124,15,0) 100%)',
    iconColor: 'text-lime-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.reports',
    href: '/dashboard/reports',
    icon: ClipboardList,
    gradient: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(217,119,6,0.08) 55%, rgba(180,83,9,0) 100%)',
    iconColor: 'text-amber-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
  },
  {
    titleKey: 'sidebar.education',
    href: '/dashboard/education',
    icon: BookOpen,
    gradient: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.08) 55%, rgba(21,128,61,0) 100%)',
    iconColor: 'text-green-500',
  },
  {
    titleKey: 'sidebar.auditLog',
    href: '/dashboard/audit',
    icon: ShieldCheck,
    gradient: 'radial-gradient(circle, rgba(100,116,139,0.2) 0%, rgba(71,85,105,0.08) 55%, rgba(51,65,85,0) 100%)',
    iconColor: 'text-slate-500',
    allowedRoles: ['ADMIN'],
  },
  {
    titleKey: 'sidebar.staffUsers',
    href: '/dashboard/users',
    icon: UserCog,
    gradient: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.08) 55%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
    allowedRoles: ['ADMIN'],
  },
  {
    titleKey: 'sidebar.production',
    href: '/dashboard/production',
    icon: Gauge,
    gradient: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.08) 55%, rgba(4,120,87,0) 100%)',
    iconColor: 'text-emerald-500',
    allowedRoles: ['ADMIN'],
  },
  {
    titleKey: 'sidebar.notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    gradient: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(234,88,12,0.08) 55%, rgba(194,65,12,0) 100%)',
    iconColor: 'text-orange-500',
  },
  {
    titleKey: 'sidebar.settings',
    href: '/dashboard/settings',
    icon: Settings,
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.08) 55%, rgba(67,56,202,0) 100%)',
    iconColor: 'text-indigo-500',
    allowedRoles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const userRole = (session?.user as { role?: UserRole } | undefined)?.role;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleItems = sidebarItems.filter(
    (item) => !item.allowedRoles || !userRole || item.allowedRoles.includes(userRole)
  );

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
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t('sidebar.careWorkspace')}</p>
                  <p className="text-sm font-medium text-foreground">{t('sidebar.maternalHealthOps')}</p>
                </div>
              )}
            </div>
          </div>
          <nav className="space-y-2 px-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const title = t(item.titleKey);
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="block"
                  title={isCollapsed ? title : undefined}
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
                    {isActive && (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-100 blur-xl"
                        style={{ background: item.gradient }}
                      />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: item.gradient }}
                    />
                    <item.icon
                      className={cn(
                        'relative z-10 h-4 w-4 flex-shrink-0 transition-colors duration-300',
                        isActive ? item.iconColor : 'text-muted-foreground group-hover:' + item.iconColor
                      )}
                    />
                    {!isCollapsed && (
                      <span className="relative z-10 truncate">{title}</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border/60 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="w-full justify-center rounded-xl hover:bg-background/55"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
