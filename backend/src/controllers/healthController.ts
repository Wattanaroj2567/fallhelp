import { Request, Response } from 'express';
import prisma from '../prisma';
import { mqttClient } from '../iot/mqtt/mqttClient';

/**
 * Health Check Controller
 * Returns system status including MQTT and Database connectivity
 */
export const getHealth = async (_req: Request, res: Response) => {
  const startTime = Date.now();

  // Check Database
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  // Check MQTT
  const mqttStatus = mqttClient.isClientConnected() ? 'connected' : 'disconnected';

  // Calculate uptime
  const uptimeSeconds = process.uptime();
  const uptimeFormatted = formatUptime(uptimeSeconds);

  // Overall status
  const allHealthy = dbStatus === 'connected'; // MQTT can be optional (simulator mode)

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    responseTimeMs: Date.now() - startTime,
    services: {
      database: dbStatus,
      mqtt: mqttStatus,
    },
    version: process.env.npm_package_version || '1.0.0',
  });
};

/**
 * Format uptime to human readable string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}
