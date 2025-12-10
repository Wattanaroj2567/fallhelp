import {
  listEvents,
  getRecentEvents,
  getEvent,
  cancelEvent,
  getDailyStats,
  getMonthlyStats,
} from '../eventService';
import { apiClient } from '../api';
import type { Event, Paginated, DailyStat, MonthlyStat } from '../types';

// Mock dependencies
jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  toApiError: jest.fn((error) => error),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('eventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // ✅ Test Group 1: List Events
  // จากโค้ดจริง: listEvents() function
  // ==========================================

  describe('listEvents', () => {
    it('should fetch paginated events successfully', async () => {
      const mockEvents: Paginated<Event> = {
        data: [
          {
            id: '1',
            type: 'FALL',
            severity: 'CRITICAL',
            timestamp: '2024-01-15T10:30:00Z',
            deviceId: 'device-1',
            elderId: 'elder-1',
            isCancelled: false,
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockEvents });

      const result = await listEvents({ page: 1, pageSize: 10 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events', {
        params: { page: 1, pageSize: 10 },
      });
      expect(result).toEqual(mockEvents);
      expect(result.data).toHaveLength(1);
    });

    it('should fetch events with filters', async () => {
      const filters = {
        elderId: 'elder-1',
        type: 'FALL',
        severity: 'CRITICAL',
        page: 1,
        pageSize: 20,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: { data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 },
      });

      await listEvents(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events', { params: filters });
    });

    it('should handle errors when fetching events', async () => {
      mockApiClient.get.mockRejectedValueOnce({
        status: 500,
        message: 'Internal server error',
      });

      await expect(listEvents()).rejects.toMatchObject({
        status: 500,
        message: 'Internal server error',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 2: Recent Events
  // จากโค้ดจริง: getRecentEvents() function
  // ==========================================

  describe('getRecentEvents', () => {
    it('should fetch recent events successfully', async () => {
      const mockRecentEvents: Event[] = [
        {
          id: '1',
          type: 'FALL',
          severity: 'CRITICAL',
          timestamp: '2024-01-15T10:30:00Z',
          deviceId: 'device-1',
          elderId: 'elder-1',
          isCancelled: false,
        },
        {
          id: '2',
          type: 'HEART_RATE_HIGH',
          severity: 'WARNING',
          timestamp: '2024-01-15T09:15:00Z',
          deviceId: 'device-1',
          elderId: 'elder-1',
          isCancelled: false,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({ data: mockRecentEvents });

      const result = await getRecentEvents();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events/recent');
      expect(result).toEqual(mockRecentEvents);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no recent events', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [] });

      const result = await getRecentEvents();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // ✅ Test Group 3: Single Event
  // จากโค้ดจริง: getEvent() function
  // ==========================================

  describe('getEvent', () => {
    it('should fetch single event by ID successfully', async () => {
      const mockEvent: Event = {
        id: '1',
        type: 'FALL',
        severity: 'CRITICAL',
        timestamp: '2024-01-15T10:30:00Z',
        deviceId: 'device-1',
        elderId: 'elder-1',
        isCancelled: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockEvent });

      const result = await getEvent('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events/1');
      expect(result).toEqual(mockEvent);
    });

    it('should handle event not found', async () => {
      mockApiClient.get.mockRejectedValueOnce({
        status: 404,
        message: 'Event not found',
      });

      await expect(getEvent('999')).rejects.toMatchObject({
        status: 404,
        message: 'Event not found',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 4: Cancel Event
  // จากโค้ดจริง: cancelEvent() function
  // ==========================================

  describe('cancelEvent', () => {
    it('should cancel event successfully', async () => {
      const mockCancelledEvent: Event = {
        id: '1',
        type: 'FALL',
        severity: 'CRITICAL',
        timestamp: '2024-01-15T10:30:00Z',
        deviceId: 'device-1',
        elderId: 'elder-1',
        isCancelled: true,
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockCancelledEvent });

      const result = await cancelEvent('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/events/1/cancel');
      expect(result.isCancelled).toBe(true);
    });

    it('should handle already cancelled event', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        status: 400,
        message: 'Event already cancelled',
      });

      await expect(cancelEvent('1')).rejects.toMatchObject({
        status: 400,
        message: 'Event already cancelled',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 5: Daily Statistics
  // จากโค้ดจริง: getDailyStats() function
  // ==========================================

  describe('getDailyStats', () => {
    it('should fetch daily statistics successfully', async () => {
      const mockDailyStats: DailyStat[] = [
        {
          date: '2024-01-15',
          fall: 2,
          heartRateHigh: 5,
          total: 7,
        },
        {
          date: '2024-01-14',
          fall: 0,
          heartRateHigh: 3,
          total: 3,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({ data: mockDailyStats });

      const result = await getDailyStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events/stats/daily');
      expect(result).toEqual(mockDailyStats);
      expect(result).toHaveLength(2);
    });

    it('should handle no statistics available', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [] });

      const result = await getDailyStats();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // ✅ Test Group 6: Monthly Statistics
  // จากโค้ดจริง: getMonthlyStats() function
  // ==========================================

  describe('getMonthlyStats', () => {
    it('should fetch monthly statistics successfully', async () => {
      const mockMonthlyStats: MonthlyStat[] = [
        {
          month: '2024-01',
          fall: 15,
          heartRateHigh: 42,
          total: 57,
        },
        {
          month: '2023-12',
          fall: 8,
          heartRateHigh: 31,
          total: 39,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({ data: mockMonthlyStats });

      const result = await getMonthlyStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/events/stats/monthly');
      expect(result).toEqual(mockMonthlyStats);
      expect(result).toHaveLength(2);
    });

    it('should handle errors fetching monthly stats', async () => {
      mockApiClient.get.mockRejectedValueOnce({
        status: 500,
        message: 'Failed to calculate statistics',
      });

      await expect(getMonthlyStats()).rejects.toMatchObject({
        status: 500,
        message: 'Failed to calculate statistics',
      });
    });
  });
});
