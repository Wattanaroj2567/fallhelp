import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import createDebug from 'debug';

const log = createDebug('fallhelp:socket');

// ==========================================
// 📡 LAYER: Interface (Real-time)
// Purpose: Manage WebSocket connections and real-time event broadcasting
// ==========================================

class SocketServerManager {
  private io: Server | null = null;
  private connectedClients: Map<string, Socket> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> socketId mapping

  /**
   * Initialize Socket.io server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', this.handleConnection.bind(this));

    log('Socket.io server initialized');
  }

  /**
   * Handle new client connection
   */
  private handleConnection(socket: Socket): void {
    // ลด log ตอน connect (แสดงแค่ authenticate แทน)
    // log('Client connected: %s', socket.id);

    // Store client connection
    this.connectedClients.set(socket.id, socket);

    // Handle client authentication with elderId
    socket.on('authenticate', (data: { userId?: string; elderId?: string }) => {
      // ตรวจสอบว่ามี session เก่าของ user นี้อยู่หรือไม่
      if (data.userId) {
        const oldSocketId = this.userSessions.get(data.userId);

        if (oldSocketId && oldSocketId !== socket.id) {
          // Disconnect old session
          const oldSocket = this.connectedClients.get(oldSocketId);
          if (oldSocket) {
            log('Disconnecting old session %s (replaced by %s)', oldSocketId, socket.id);
            oldSocket.disconnect(true);
            this.connectedClients.delete(oldSocketId);
          }
        }

        // บันทึก session ใหม่
        this.userSessions.set(data.userId, socket.id);
      }

      log(
        'Client %s authenticated: { userId: %s, elderId: %s }',
        socket.id,
        data.userId || 'none',
        data.elderId || 'none',
      );

      // Join user-specific room
      if (data.userId) {
        socket.join(`user:${data.userId}`);
        log('Client %s joined room: user:%s', socket.id, data.userId);
      }

      // Join elder-specific room
      if (data.elderId) {
        socket.join(`elder:${data.elderId}`);
        log('Client %s joined room: elder:%s', socket.id, data.elderId);
      }

      socket.emit('authenticated', { success: true });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      log('Client disconnected: %s', socket.id);
      this.connectedClients.delete(socket.id);

      // ลบ user session mapping
      for (const [userId, socketId] of this.userSessions.entries()) {
        if (socketId === socket.id) {
          this.userSessions.delete(userId);
          break;
        }
      }
    });

    // Handle ping for connection testing
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Emit fall detection event to relevant clients
   */
  emitFallDetected(data: {
    eventId: string;
    elderId: string;
    elderName: string;
    deviceId: string;
    deviceCode: string;
    timestamp: Date;
    severity: string;
    accelerationMagnitude: number;
  }): void {
    if (!this.io) return;

    log('Emitting fall detected for elder %s', data.elderId);

    // Emit to all clients watching this elder
    this.io.to(`elder:${data.elderId}`).emit('fall_detected', {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Emit heart rate alert to relevant clients
   */
  emitHeartRateAlert(data: {
    eventId: string;
    elderId: string;
    elderName: string;
    deviceId: string;
    deviceCode: string;
    timestamp: Date;
    heartRate: number;
    severity: string;
    type: 'LOW' | 'HIGH';
  }): void {
    if (!this.io) return;

    log('Emitting heart rate alert for elder %s', data.elderId);

    this.io.to(`elder:${data.elderId}`).emit('heart_rate_alert', {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Emit normal heart rate update (no alert)
   */
  emitHeartRateUpdate(data: {
    elderId: string;
    elderName: string;
    deviceId: string;
    deviceCode: string;
    timestamp: Date;
    heartRate: number;
  }): void {
    if (!this.io) return;

    this.io.to(`elder:${data.elderId}`).emit('heart_rate_update', {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Emit device status update
   */
  emitDeviceStatusUpdate(data: {
    deviceId: string;
    deviceCode: string;
    elderId: string;
    elderName: string;
    online: boolean;
    batteryLevel?: number;
    signalStrength?: number;
    firmwareVersion?: string;
    timestamp: Date;
    alert?: string;
  }): void {
    if (!this.io) return;

    log('Emitting device status update for device %s', data.deviceCode);

    this.io.to(`elder:${data.elderId}`).emit('device_status_update', {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Emit event status change (e.g., fall cancelled)
   */
  emitEventStatusChanged(data: {
    eventId: string;
    elderId: string;
    status: string;
    timestamp: Date;
  }): void {
    if (!this.io) return;

    log('Emitting event status change: %s -> %s', data.eventId, data.status);

    this.io.to(`elder:${data.elderId}`).emit('event_status_changed', {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Broadcast system message to all clients
   */
  broadcastSystemMessage(message: string, data?: unknown): void {
    if (!this.io) return;

    log('Broadcasting system message: %s', message);

    this.io.emit('system_message', {
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Close Socket.io server
   */
  close(): void {
    if (this.io) {
      this.io.close();
      this.connectedClients.clear();
      log('Socket.io server closed');
    }
  }
}

// Export singleton instance
export const socketServer = new SocketServerManager();
