'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Calendar, Home, Settings, User } from 'lucide-react';
import { MenuBar } from '@/components/ui/glow-menu';

export function MenuBarDemo() {
  const pathname = usePathname();

  const menuItems = useMemo(
    () => [
      {
        icon: Home,
        label: 'Home',
        href: '/dashboard',
        gradient:
          'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(37,99,235,0.1) 50%, rgba(29,78,216,0) 100%)',
        iconColor: 'text-blue-500',
      },
      {
        icon: Bell,
        label: 'Notifications',
        href: '/dashboard/notifications',
        gradient:
          'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.08) 50%, rgba(194,65,12,0) 100%)',
        iconColor: 'text-orange-500',
      },
      {
        icon: Settings,
        label: 'Settings',
        href: '/dashboard/settings',
        gradient:
          'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.08) 50%, rgba(21,128,61,0) 100%)',
        iconColor: 'text-green-500',
      },
      {
        icon: User,
        label: 'Profile',
        href: '/profile',
        gradient:
          'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.08) 50%, rgba(185,28,28,0) 100%)',
        iconColor: 'text-red-500',
      },
      {
        icon: Calendar,
        label: 'Appointments',
        href: '/appointments',
        gradient:
          'radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(147,51,234,0.08) 50%, rgba(126,34,206,0) 100%)',
        iconColor: 'text-violet-500',
      },
    ],
    [],
  );

  const activeItem = menuItems.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))?.label ?? 'Home';

  return <MenuBar items={menuItems} activeItem={activeItem} />;
}
