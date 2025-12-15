/**
 * 🧪 Priority 2: Emergency Notification Flow Tests
 *
 * Tests for the notification service that sends push notifications
 * to caregivers during emergencies.
 */

// ==========================================
// Setup mocks BEFORE imports
// ==========================================

// Mock Prisma
const mockNotificationCreate = jest.fn();
const mockNotificationUpdate = jest.fn();
const mockElderFindUnique = jest.fn();

jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      create: mockNotificationCreate,
      update: mockNotificationUpdate,
    },
    elder: {
      findUnique: mockElderFindUnique,
    },
  },
}));

// Mock Push Notification utilities
const mockSendNotification = jest.fn();
const mockSendFallAlert = jest.fn();
const mockSendHeartRateAlert = jest.fn();
const mockSendDeviceOfflineAlert = jest.fn();

jest.mock('../../utils/pushNotification', () => ({
  sendNotification: mockSendNotification,
  sendFallAlert: mockSendFallAlert,
  sendHeartRateAlert: mockSendHeartRateAlert,
  sendDeviceOfflineAlert: mockSendDeviceOfflineAlert,
}));

// Mock Debug
jest.mock('debug', () => () => () => {});

// ==========================================
// Import AFTER mocks
// ==========================================
import {
  notifyFallDetection,
  notifyHeartRateAlert,
  createNotification,
} from '../../services/notificationService';

describe('🚨 Priority 2: Emergency Notification Flow', () => {
  const MOCK_ELDER = {
    id: 'elder-001',
    firstName: 'สมหญิง',
    lastName: 'รักษาสุขภาพ',
    caregivers: [
      {
        userId: 'caregiver-001',
        user: {
          id: 'caregiver-001',
          firstName: 'นายสมศักดิ์',
          lastName: 'ใจดี',
          pushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        },
      },
      {
        userId: 'caregiver-002',
        user: {
          id: 'caregiver-002',
          firstName: 'นางสมใจ',
          lastName: 'ใจดี',
          pushToken: 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]',
        },
      },
    ],
  };

  const MOCK_EVENT_ID = 'event-uuid-001';
  const MOCK_TIMESTAMP = new Date('2024-12-15T10:30:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock returns
    mockElderFindUnique.mockResolvedValue(MOCK_ELDER);
    mockNotificationCreate.mockImplementation((args) =>
      Promise.resolve({ id: 'notification-' + Date.now(), ...args.data }),
    );
    mockNotificationUpdate.mockResolvedValue({});
    mockSendNotification.mockResolvedValue(true);
    mockSendFallAlert.mockResolvedValue(undefined);
    mockSendHeartRateAlert.mockResolvedValue(undefined);
  });

  // ==========================================
  // Test 1: Fall detection notifies all caregivers
  // ==========================================
  describe('notifyFallDetection', () => {
    it('should send push notification to ALL caregivers with push tokens', async () => {
      await notifyFallDetection(MOCK_ELDER.id, MOCK_EVENT_ID, MOCK_TIMESTAMP);

      expect(mockSendFallAlert).toHaveBeenCalledTimes(1);
      expect(mockSendFallAlert).toHaveBeenCalledWith(
        ['ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]'],
        'สมหญิง รักษาสุขภาพ',
        MOCK_TIMESTAMP,
      );
    });

    it('should create notification records for each caregiver', async () => {
      await notifyFallDetection(MOCK_ELDER.id, MOCK_EVENT_ID, MOCK_TIMESTAMP);

      // 2 caregivers = 2 notification records
      expect(mockNotificationCreate).toHaveBeenCalledTimes(2);
    });

    it('should handle elder with no caregivers gracefully', async () => {
      mockElderFindUnique.mockResolvedValue({
        ...MOCK_ELDER,
        caregivers: [],
      });

      await notifyFallDetection(MOCK_ELDER.id, MOCK_EVENT_ID, MOCK_TIMESTAMP);

      expect(mockSendFallAlert).not.toHaveBeenCalled();
      expect(mockNotificationCreate).not.toHaveBeenCalled();
    });

    it('should handle non-existent elder gracefully', async () => {
      mockElderFindUnique.mockResolvedValue(null);

      await notifyFallDetection('non-existent-elder', MOCK_EVENT_ID, MOCK_TIMESTAMP);

      expect(mockSendFallAlert).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Test 2: Heart rate alert notifications
  // ==========================================
  describe('notifyHeartRateAlert', () => {
    it('should send HIGH heart rate alert with correct value', async () => {
      await notifyHeartRateAlert(MOCK_ELDER.id, MOCK_EVENT_ID, MOCK_TIMESTAMP, 150, 'HIGH');

      expect(mockSendHeartRateAlert).toHaveBeenCalledWith(
        expect.any(Array),
        'สมหญิง รักษาสุขภาพ',
        150,
        'HIGH',
      );
    });

    it('should send LOW heart rate alert with correct value', async () => {
      await notifyHeartRateAlert(MOCK_ELDER.id, MOCK_EVENT_ID, MOCK_TIMESTAMP, 45, 'LOW');

      expect(mockSendHeartRateAlert).toHaveBeenCalledWith(
        expect.any(Array),
        'สมหญิง รักษาสุขภาพ',
        45,
        'LOW',
      );
    });
  });

  // ==========================================
  // Test 3: Notification creation and DB save
  // ==========================================
  describe('createNotification', () => {
    it('should save notification to database and mark as sent', async () => {
      mockSendNotification.mockResolvedValue(true);

      const notificationData = {
        userId: 'caregiver-001',
        type: 'FALL_DETECTED' as const,
        title: '⚠️ ตรวจพบการหกล้ม',
        message: 'สมหญิง รักษาสุขภาพ อาจหกล้ม กรุณาตรวจสอบด่วน!',
        pushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      };

      await createNotification(notificationData);

      // DB record created
      expect(mockNotificationCreate).toHaveBeenCalledWith({
        data: notificationData,
      });

      // Push notification sent
      expect(mockSendNotification).toHaveBeenCalledWith(
        'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        expect.objectContaining({
          title: '⚠️ ตรวจพบการหกล้ม',
          body: 'สมหญิง รักษาสุขภาพ อาจหกล้ม กรุณาตรวจสอบด่วน!',
        }),
      );

      // Notification marked as sent
      expect(mockNotificationUpdate).toHaveBeenCalled();
    });

    it('should not call update if push notification fails', async () => {
      mockSendNotification.mockResolvedValue(false);

      await createNotification({
        userId: 'caregiver-001',
        type: 'FALL_DETECTED' as const,
        title: 'Test',
        message: 'Test message',
        pushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      });

      expect(mockNotificationUpdate).not.toHaveBeenCalled();
    });
  });
});
