import { Request, Response } from 'express';
import * as eventService from '../services/eventService';
import { asyncHandler } from '../middlewares/errorHandler';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle event (fall/heart rate) retrieval and management requests
// ==========================================

/**
 * GET /api/events
 */
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { elderId, type, startDate, endDate, page, limit } = req.query;

  const result = await eventService.getEventsByElder(userId, elderId as string, {
    type: type as any,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.json({
    success: true,
    data: result.events,
    pagination: result.pagination,
  });
});

/**
 * GET /api/events/:id
 */
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { timestamp } = req.query;

  const event = await eventService.getEventById(
    userId,
    id,
    new Date(timestamp as string)
  );

  res.json({
    success: true,
    data: event,
  });
});

/**
 * POST /api/events/:id/cancel
 */
export const cancelFallEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { timestamp } = req.body;

  const event = await eventService.cancelFallEvent(
    userId,
    id,
    new Date(timestamp)
  );

  res.json({
    success: true,
    message: 'Fall event cancelled successfully',
    data: event,
  });
});

/**
 * GET /api/events/stats/daily
 */
export const getDailyStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { elderId, days } = req.query;

  const stats = await eventService.getDailyStats(
    userId,
    elderId as string,
    days ? parseInt(days as string) : 7
  );

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/events/stats/monthly
 */
export const getMonthlyStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { elderId, year, month } = req.query;

  const stats = await eventService.getMonthlyStats(
    userId,
    elderId as string,
    parseInt(year as string),
    parseInt(month as string)
  );

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/events/recent
 */
export const getRecentEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { limit } = req.query;

  const events = await eventService.getRecentEvents(
    userId,
    limit ? parseInt(limit as string) : 10
  );

  res.json({
    success: true,
    data: events,
  });
});
