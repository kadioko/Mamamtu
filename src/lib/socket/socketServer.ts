import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '@/lib/logger';
import { auth } from '@/auth';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface SocketData {
  userId: string;
  userRole: string;
}

export class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify token with NextAuth
        const session = await auth({ token });
        if (!session?.user) {
          return next(new Error('Invalid authentication token'));
        }

        socket.userId = session.user.id;
        socket.userRole = session.user.role || 'PATIENT';

        logger.info('Socket authenticated', {
          socketId: socket.id,
          userId: socket.userId,
          userRole: socket.userRole,
        });

        next();
      } catch (error) {
        logger.error('Socket authentication failed', {
          socketId: socket.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.IO server initialized');
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    // Track user connections
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);

    logger.info('User connected via WebSocket', {
      socketId: socket.id,
      userId,
      userRole,
      totalConnections: this.connectedUsers.get(userId)!.size,
    });

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join role-based rooms
    socket.join(`role:${userRole}`);

    // Handle appointment updates
    socket.on('appointment:update', (data) => {
      this.handleAppointmentUpdate(socket, data);
    });

    // Handle patient updates
    socket.on('patient:update', (data) => {
      this.handlePatientUpdate(socket, data);
    });

    // Handle medical record updates
    socket.on('medical-record:update', (data) => {
      this.handleMedicalRecordUpdate(socket, data);
    });

    // Handle notifications
    socket.on('notification:read', (data) => {
      this.handleNotificationRead(socket, data);
    });

    // Handle real-time collaboration
    socket.on('document:join', (documentId) => {
      socket.join(`document:${documentId}`);
      socket.emit('document:joined', { documentId });
    });

    socket.on('document:leave', (documentId) => {
      socket.leave(`document:${documentId}`);
      socket.emit('document:left', { documentId });
    });

    socket.on('document:edit', (data) => {
      this.handleDocumentEdit(socket, data);
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`document:${data.documentId}`).emit('typing:indicator', {
        userId,
        userName: data.userName,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`document:${data.documentId}`).emit('typing:indicator', {
        userId,
        userName: data.userName,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to MamaMtu real-time services',
      userId,
      userRole,
    });
  }

  private handleDisconnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Remove socket from user connections
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // Clean up empty user entries
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }

    logger.info('User disconnected from WebSocket', {
      socketId: socket.id,
      userId,
      remainingConnections: userSockets?.size || 0,
    });
  }

  private handleAppointmentUpdate(socket: AuthenticatedSocket, data: any) {
    const { appointmentId, updates } = data;

    // Broadcast to relevant users
    this.io?.to(`user:${updates.patientId}`).emit('appointment:updated', {
      appointmentId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Notify healthcare providers
    this.io?.to('role:HEALTHCARE_PROVIDER').emit('appointment:updated', {
      appointmentId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Appointment update broadcasted', {
      appointmentId,
      updatedBy: socket.userId,
    });
  }

  private handlePatientUpdate(socket: AuthenticatedSocket, data: any) {
    const { patientId, updates } = data;

    // Broadcast to healthcare providers
    this.io?.to('role:HEALTHCARE_PROVIDER').emit('patient:updated', {
      patientId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Notify the patient if they're not the one updating
    if (socket.userId !== patientId) {
      this.io?.to(`user:${patientId}`).emit('patient:updated', {
        patientId,
        updates,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('Patient update broadcasted', {
      patientId,
      updatedBy: socket.userId,
    });
  }

  private handleMedicalRecordUpdate(socket: AuthenticatedSocket, data: any) {
    const { recordId, patientId, updates } = data;

    // Only healthcare providers can update medical records
    if (socket.userRole !== 'HEALTHCARE_PROVIDER') {
      socket.emit('error', { message: 'Unauthorized to update medical records' });
      return;
    }

    // Broadcast to healthcare providers
    this.io?.to('role:HEALTHCARE_PROVIDER').emit('medical-record:updated', {
      recordId,
      patientId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Notify the patient
    this.io?.to(`user:${patientId}`).emit('medical-record:updated', {
      recordId,
      patientId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Medical record update broadcasted', {
      recordId,
      patientId,
      updatedBy: socket.userId,
    });
  }

  private handleNotificationRead(socket: AuthenticatedSocket, data: any) {
    const { notificationIds } = data;

    // Update other connected sockets for the same user
    socket.to(`user:${socket.userId}`).emit('notifications:read', {
      notificationIds,
      readBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Notification read status broadcasted', {
      userId: socket.userId,
      notificationCount: notificationIds.length,
    });
  }

  private handleDocumentEdit(socket: AuthenticatedSocket, data: any) {
    const { documentId, operation, content } = data;

    // Broadcast to all users in the document room except sender
    socket.to(`document:${documentId}`).emit('document:edited', {
      documentId,
      operation,
      content,
      editedBy: socket.userId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Document edit broadcasted', {
      documentId,
      editedBy: socket.userId,
      operation,
    });
  }

  // Public methods for broadcasting from server
  public broadcastToUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  public broadcastToRole(role: string, event: string, data: any) {
    this.io?.to(`role:${role}`).emit(event, data);
  }

  public broadcastToAll(event: string, data: any) {
    this.io?.emit(event, data);
  }

  public getUserConnections(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && 
           (this.connectedUsers.get(userId)?.size || 0) > 0;
  }
}

// Global socket manager instance
export const socketManager = new SocketManager();
