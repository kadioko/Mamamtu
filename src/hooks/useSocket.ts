'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<any>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const connect = useCallback(() => {
    if (!session?.user || socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: session.user.id,
      },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setState({
        connected: true,
        connecting: false,
        error: null,
      });
    });

    socket.on('disconnect', (reason: any) => {
      setState({
        connected: false,
        connecting: false,
        error: new Error(`Disconnected: ${reason}`),
      });
    });

    socket.on('connect_error', (error: any) => {
      setState({
        connected: false,
        connecting: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });

    socket.on('error', (error: any) => {
      setState(prev => ({
        ...prev,
        error: new Error(error?.message || 'Socket error'),
      }));
    });

  }, [session, reconnection, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState({
        connected: false,
        connecting: false,
        error: null,
      });
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.removeAllListeners(event);
      }
    }
  }, []);

  // Auto-connect when session is available
  useEffect(() => {
    if (autoConnect && session?.user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, session, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

// Hook for real-time appointment updates
export function useAppointmentUpdates() {
  const socket = useSocket();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!socket.connected) return;

    const handleAppointmentUpdate = (data: any) => {
      setAppointments(prev => {
        const index = prev.findIndex(apt => apt.id === data.appointmentId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data.updates };
          return updated;
        }
        return prev;
      });
    };

    const unsubscribe = socket.on('appointment:updated', handleAppointmentUpdate);

    return unsubscribe;
  }, [socket.connected, socket.on]);

  return { appointments, setAppointments };
}

// Hook for real-time patient updates
export function usePatientUpdates() {
  const socket = useSocket();
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    if (!socket.connected) return;

    const handlePatientUpdate = (data: any) => {
      setPatients(prev => {
        const index = prev.findIndex(patient => patient.id === data.patientId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data.updates };
          return updated;
        }
        return prev;
      });
    };

    const unsubscribe = socket.on('patient:updated', handlePatientUpdate);

    return unsubscribe;
  }, [socket.connected, socket.on]);

  return { patients, setPatients };
}

// Hook for real-time notifications
export function useNotifications() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket.connected) return;

    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = (data: any) => {
      setNotifications(prev => 
        prev.map(notif => 
          data.notificationIds.includes(notif.id)
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => 
        Math.max(0, prev - data.notificationIds.length)
      );
    };

    const unsubscribeNotification = socket.on('notification', handleNotification);
    const unsubscribeRead = socket.on('notifications:read', handleNotificationRead);

    return () => {
      unsubscribeNotification();
      unsubscribeRead();
    };
  }, [socket.connected, socket.on]);

  const markAsRead = useCallback((notificationIds: string[]) => {
    socket.emit('notification:read', { notificationIds });
  }, [socket]);

  return {
    notifications,
    unreadCount,
    markAsRead,
  };
}

// Hook for collaborative document editing
export function useDocumentCollaboration(documentId: string) {
  const socket = useSocket();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!socket.connected || !documentId) return;

    // Join document room
    socket.emit('document:join', documentId);

    const handleDocumentEdit = (data: any) => {
      // Handle document edits from other users
      console.log('Document edited:', data);
    };

    const handleTypingIndicator = (data: any) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    };

    const unsubscribeEdit = socket.on('document:edited', handleDocumentEdit);
    const unsubscribeTyping = socket.on('typing:indicator', handleTypingIndicator);

    return () => {
      unsubscribeEdit();
      unsubscribeTyping();
      socket.emit('document:leave', documentId);
    };
  }, [socket.connected, documentId, socket.emit, socket.on]);

  const editDocument = useCallback((operation: any, content: any) => {
    socket.emit('document:edit', {
      documentId,
      operation,
      content,
    });
  }, [socket]);

  const startTyping = useCallback((userName: string) => {
    socket.emit('typing:start', { documentId, userName });
  }, [socket]);

  const stopTyping = useCallback(() => {
    socket.emit('typing:stop', { documentId });
  }, [socket]);

  return {
    collaborators,
    typingUsers,
    editDocument,
    startTyping,
    stopTyping,
  };
}
