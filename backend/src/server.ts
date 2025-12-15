// Load environment variables FIRST (must be before any other imports)
import 'dotenv/config';

import http from 'http';
import app from './app';
import createDebug from 'debug';
import prisma from './prisma';
import { socketServer } from './iot/socket/socketServer';
import { mqttClient } from './iot/mqtt/mqttClient';
import { cleanupExpiredOtps } from './services/authService';

// ==========================================
// ⚙️ LAYER: Core (Server Entry Point)
// Purpose: Initialize HTTP server, Database, Socket.io, and MQTT
// ==========================================

const PORT = process.env.PORT || 3000;
const log = createDebug('fallhelp:server');
const logIo = createDebug('fallhelp:socket');
const logMqtt = createDebug('fallhelp:mqtt');
const logApi = createDebug('fallhelp:api');

const server = http.createServer(app);
log('Starting HTTP server...');

// Initialize Socket.io
socketServer.initialize(server);
logIo('Socket.io initialized');

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('SIGTERM received, closing server...');
  socketServer.close();
  logIo('Socket.io server closed');
  await mqttClient.disconnect();
  logMqtt('MQTT Client disconnected');
  await prisma.$disconnect();
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  log('SIGINT received, closing server...');
  socketServer.close();
  logIo('Socket.io server closed');
  await mqttClient.disconnect();
  logMqtt('MQTT Client disconnected');
  await prisma.$disconnect();
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, async () => {
  log(`Backend listening on port ${PORT}`);
  logApi(`API: http://localhost:${PORT}/api`);
  logApi(`Health: http://localhost:${PORT}/api/health`);
  logApi(`Docs: http://localhost:${PORT}/docs`);
  logApi(`OpenAPI: http://localhost:${PORT}/openapi.yaml`);
  logIo('Socket.io initialized (awaiting client connections)');

  // Initialize MQTT client (optional - will not crash if broker is unavailable)
  const MQTT_DISABLED = process.env.MQTT_DISABLED === 'true';
  if (MQTT_DISABLED) {
    logMqtt('MQTT disabled by config (MQTT_DISABLED=true)');
  } else {
    try {
      logMqtt('Connecting to MQTT broker...');
      await mqttClient.connect();
    } catch (_error) {
      logMqtt('MQTT broker not available - IoT features disabled');
      logMqtt('To enable IoT, start a broker and set MQTT_BROKER_URL or unset MQTT_DISABLED');
    }
  }

  // Cleanup expired OTPs every hour
  setInterval(
    async () => {
      try {
        await cleanupExpiredOtps();
      } catch (error) {
        log('Error cleaning up expired OTPs: %O', error);
      }
    },
    60 * 60 * 1000,
  ); // 1 hour

  // Run initial cleanup on startup
  cleanupExpiredOtps().catch((error) => {
    log('Error in initial OTP cleanup: %O', error);
  });
});
