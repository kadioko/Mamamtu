'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationPanel } from './NotificationPanel';

const NOTIFICATION_POLL_INTERVAL_MS = 120000;

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const countAbortRef = useRef<AbortController | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;

    countAbortRef.current?.abort();
    const controller = new AbortController();
    countAbortRef.current = controller;

    try {
      const response = await fetch('/api/notifications?countOnly=true', {
        signal: controller.signal,
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Error fetching unread count:', error);
    } finally {
      if (countAbortRef.current === controller) {
        countAbortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = window.setInterval(fetchUnreadCount, NOTIFICATION_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      countAbortRef.current?.abort();
    };
  }, [fetchUnreadCount]);

  const handleUnreadCountRefresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) fetchUnreadCount();
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationPanel
          onClose={() => undefined}
          onMarkAllRead={handleMarkAllRead}
          onNotificationRead={handleUnreadCountRefresh}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
