/**
 * 🧪 Priority 1: IoT Logic Tests (Life Saving)
 * 
 * Tests for the critical fall detection handler.
 * These tests simulate MQTT messages with REAL payload structures
 * that ESP32 devices actually send.
 */

import { FallDetectionPayload } from '../../iot/mqtt/topics';

// ==========================================
// Setup mocks BEFORE imports
// ==========================================

// Mock Prisma
const mockFindFirst = jest.fn();
jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    device: {
      findFirst: mockFindFirst,
    },
  },
}));

// Mock Event Service  
const mockCreateEvent = jest.fn();
jest.mock('../../services/eventService', () => ({
  createEvent: mockCreateEvent,
}));

// Mock Notification Service
const mockNotifyFallDetection = jest.fn();
jest.mock('../../services/notificationService', () => ({
  notifyFallDetection: mockNotifyFallDetection,
}));

// Mock Socket Server
const mockEmitFallDetected = jest.fn();
jest.mock('../../iot/socket/socketServer', () => ({
  socketServer: {
    emitFallDetected: mockEmitFallDetected,
  },
}));

// Mock Debug
jest.mock('debug', () => () => () => {});

// ==========================================
// Import handler AFTER mocks
// ==========================================
import { fallHandler } from '../../iot/mqtt/handlers/fallHandler';

describe('🚨 Priority 1: Fall Detection Handler (Life Saving Logic)', () => {
  // Real ESP32 Payload Structure
  const REAL_ESP32_FALL_PAYLOAD: FallDetectionPayload = {
    timestamp: '2024-12-15T10:30:00.000Z',
    accelerationX: 0.5,
    accelerationY: -9.8,
    accelerationZ: 2.1,
    magnitude: 15.5,
  };

  const MOCK_DEVICE_ID = 'ESP32-6C689BDAF380';

  const MOCK_DEVICE = {
    id: 'device-uuid-001',
    deviceCode: '8E5D02FB',
    serialNumber: MOCK_DEVICE_ID,
    elderId: 'elder-uuid-001',
    elder: {
      id: 'elder-uuid-001',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
    },
  };

  const MOCK_EVENT = {
    id: 'event-uuid-001',
    elderId: MOCK_DEVICE.elderId,
    deviceId: MOCK_DEVICE.id,
    type: 'FALL',
    severity: 'CRITICAL',
    timestamp: new Date(REAL_ESP32_FALL_PAYLOAD.timestamp),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockFindFirst.mockResolvedValue(MOCK_DEVICE);
    mockCreateEvent.mockResolvedValue(MOCK_EVENT);
    mockNotifyFallDetection.mockResolvedValue(undefined);
  });

  // ==========================================
  // Test 1: Data saved to database correctly
  // ==========================================
  it('should create a CRITICAL fall event in database with correct payload data', async () => {
    await fallHandler(MOCK_DEVICE_ID, REAL_ESP32_FALL_PAYLOAD);

    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    expect(mockCreateEvent).toHaveBeenCalledWith({
      elderId: MOCK_DEVICE.elderId,
      deviceId: MOCK_DEVICE.id,
      type: 'FALL',
      severity: 'CRITICAL',
      accelerometerX: REAL_ESP32_FALL_PAYLOAD.accelerationX,
      accelerometerY: REAL_ESP32_FALL_PAYLOAD.accelerationY,
      accelerometerZ: REAL_ESP32_FALL_PAYLOAD.accelerationZ,
      metadata: { magnitude: REAL_ESP32_FALL_PAYLOAD.magnitude },
      timestamp: new Date(REAL_ESP32_FALL_PAYLOAD.timestamp),
    });
  });

  // ==========================================
  // Test 2: Notification sent to caregivers
  // ==========================================
  it('should call notifyFallDetection to alert caregivers', async () => {
    await fallHandler(MOCK_DEVICE_ID, REAL_ESP32_FALL_PAYLOAD);

    expect(mockNotifyFallDetection).toHaveBeenCalledTimes(1);
    expect(mockNotifyFallDetection).toHaveBeenCalledWith(
      MOCK_DEVICE.elderId,
      MOCK_EVENT.id,
      MOCK_EVENT.timestamp
    );
  });

  // ==========================================
  // Test 3: Socket.io real-time event emitted
  // ==========================================
  it('should emit Socket.io event for real-time dashboard update', async () => {
    await fallHandler(MOCK_DEVICE_ID, REAL_ESP32_FALL_PAYLOAD);

    expect(mockEmitFallDetected).toHaveBeenCalledTimes(1);
    expect(mockEmitFallDetected).toHaveBeenCalledWith({
      eventId: MOCK_EVENT.id,
      elderId: MOCK_DEVICE.elderId,
      elderName: 'สมชาย ใจดี',
      deviceId: MOCK_DEVICE.id,
      deviceCode: MOCK_DEVICE.deviceCode,
      timestamp: MOCK_EVENT.timestamp,
      severity: MOCK_EVENT.severity,
      accelerationMagnitude: REAL_ESP32_FALL_PAYLOAD.magnitude,
    });
  });

  // ==========================================
  // Test 4: Unknown device handling
  // ==========================================
  it('should gracefully handle unknown device (not in database)', async () => {
    mockFindFirst.mockResolvedValue(null);

    await fallHandler('UNKNOWN_DEVICE', REAL_ESP32_FALL_PAYLOAD);

    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(mockNotifyFallDetection).not.toHaveBeenCalled();
    expect(mockEmitFallDetected).not.toHaveBeenCalled();
  });

  // ==========================================
  // Test 5: Unpaired device handling
  // ==========================================
  it('should not process fall event for unpaired device (no elder)', async () => {
    mockFindFirst.mockResolvedValue({
      ...MOCK_DEVICE,
      elderId: null,
      elder: null,
    });

    await fallHandler(MOCK_DEVICE_ID, REAL_ESP32_FALL_PAYLOAD);

    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(mockNotifyFallDetection).not.toHaveBeenCalled();
  });

  // ==========================================
  // Test 6: Complete flow integration
  // ==========================================
  it('should execute complete critical path: DB -> Notify -> Socket', async () => {
    await fallHandler(MOCK_DEVICE_ID, REAL_ESP32_FALL_PAYLOAD);

    // Verify device lookup
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { serialNumber: MOCK_DEVICE_ID },
      include: {
        elder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Verify all 3 critical operations occurred
    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    expect(mockNotifyFallDetection).toHaveBeenCalledTimes(1);
    expect(mockEmitFallDetected).toHaveBeenCalledTimes(1);
  });
});
