// WebSocket service using dynamic imports for Next.js compatibility
type Callback = (data: unknown) => void;

declare global {
  interface Window {
    socket?: any;
  }
}

export class WebSocketService {
  private socket: any = null;
  private static instance: WebSocketService;
  private callbacks: Record<string, Callback[]> = {};
  private isInitialized = false;
  private eventQueue: Array<{ event: string; data: unknown }> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Subscribe to a WebSocket event
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event is received
   * @returns A function to unsubscribe from the event
   */
  public on<T = unknown>(event: string, callback: (data: T) => void): () => void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }

    const cb = callback as unknown as Callback;
    this.callbacks[event].push(cb);
    
    // If socket is already initialized, set up the listener
    if (this.socket) {
      this.socket.on(event, callback);
    }
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Unsubscribe from a WebSocket event
   * @param event The event name to unsubscribe from
   * @param callback The callback function to remove
   */
  public off<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.callbacks[event]) return;

    const cb = callback as unknown as Callback;
    
    const index = this.callbacks[event].indexOf(cb);
    if (index > -1) {
      this.callbacks[event].splice(index, 1);
    }
    
    // If socket is initialized, remove the listener
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  private async initialize() {
    if (typeof window === 'undefined') return;
    if (this.isInitialized) return;
    
    try {
      // Use dynamic import for client-side only
      const io = (await import('socket.io-client')).default;
      
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      } as any);

      // For debugging
      if (process.env.NODE_ENV === 'development') {
        window.socket = this.socket;
      }
      
      // Set up event listeners for all registered callbacks
      Object.entries(this.callbacks).forEach(([event, callbacks]) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
      
      // Process any queued events
      this.eventQueue.forEach(({ event, data }) => {
        this.emit(event, data);
      });
      this.eventQueue = [];
      
      this.isInitialized = true;

      // Set up connection status listeners
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
      
      this.socket.on('error', (error: unknown) => {
        console.error('WebSocket error:', error);
      });

      // Forward all events to registered callbacks
      this.socket.onAny((event: string, data: unknown) => {
        this.trigger(event, data);
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Emit an event to the server
  public emit(event: string, data: unknown) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      // Queue the event if socket is not yet initialized
      this.eventQueue.push({ event, data });
    }
  }

  // Trigger callbacks for an event
  private trigger(event: string, data: unknown) {
    const callbacks = this.callbacks[event] || [];
    callbacks.forEach(callback => callback(data));
  }

  // Disconnect the socket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }
}

export const socket = WebSocketService.getInstance();
