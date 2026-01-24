'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Check, Trash2, Settings, AlertCircle, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: number;
  readAt: string | null;
  createdAt: string;
  appointment?: {
    title: string;
    startTime: string;
  };
  patient?: {
    firstName: string;
    lastName: string;
  };
}

interface NotificationPanelProps {
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationRead: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_CANCELLED':
    case 'APPOINTMENT_RESCHEDULED':
      return <Calendar className="h-4 w-4" />;
    case 'LAB_RESULT_READY':
      return <FileText className="h-4 w-4" />;
    case 'HIGH_RISK_ALERT':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: number) => {
  if (priority >= 2) return 'bg-red-100 border-red-300';
  if (priority >= 1) return 'bg-yellow-100 border-yellow-300';
  return 'bg-gray-50 border-gray-200';
};

export function NotificationPanel({ onClose, onMarkAllRead, onNotificationRead }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = filter === 'unread' 
        ? '/api/notifications?unreadOnly=true&limit=20'
        : '/api/notifications?limit=20';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
        );
        onNotificationRead();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        onNotificationRead();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllReadClick = async () => {
    await onMarkAllRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <Link href={'/dashboard/notifications/preferences' as any}>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="flex-1"
          >
            Unread
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllReadClick}
            disabled={notifications.every(n => n.readAt)}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'unread' ? "You're all caught up!" : "You'll see notifications here"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-2 rounded-lg border transition-colors ${
                  notification.readAt ? 'bg-white' : getPriorityColor(notification.priority)
                } hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${notification.priority >= 2 ? 'text-red-600' : notification.priority >= 1 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.readAt && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.appointment && (
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.appointment.title} - {format(new Date(notification.appointment.startTime), 'MMM dd, HH:mm')}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                      </span>
                      
                      <div className="flex gap-1">
                        {!notification.readAt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 px-2"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Link href={'/dashboard/notifications' as any}>
            <Button variant="outline" className="w-full" size="sm">
              View All Notifications
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
