import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/Config';
import Logger from '@/utils/logger';

// Constants
const STALE_HEARTBEAT_THRESHOLD_MS = 20_000; // 20 seconds (safety margin above ESP32's 15s interval)
const WATCHDOG_CHECK_INTERVAL_MS = 5_000; // 5 seconds

export const useSocket = (elderId: string | undefined, deviceId: string | undefined) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false); // Server connection state
  const [wasEverConnected, setWasEverConnected] = useState(false); // Track if ever connected (for reconnect Toast)
  const [fallStatus, setFallStatus] = useState<'NORMAL' | 'FALL' | null>(null);
  const [lastFallUpdate, setLastFallUpdate] = useState<Date | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [lastHeartUpdate, setLastHeartUpdate] = useState<Date | null>(null);

  const [activeFallEventId, setActiveFallEventId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const appState = useRef(AppState.currentState);
  const lastHeartUpdateRef = useRef<Date | null>(null);

  // Update ref when lastHeartUpdate changes (for watchdog to access)
  useEffect(() => {
    lastHeartUpdateRef.current = lastHeartUpdate;
  }, [lastHeartUpdate]);

  // Watchdog: Check for stale data
  // ✅ FIXED: Remove isConnected from dependencies to prevent infinite loops
  // ✅ FIXED: Clearer logic without confusing ternaries
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (lastHeartUpdateRef.current) {
        const now = new Date();
        const diff = now.getTime() - lastHeartUpdateRef.current.getTime();

        if (diff > STALE_HEARTBEAT_THRESHOLD_MS && isConnected) {
          Logger.warn('Data stale: No heart rate update for 30s. Marking as offline.');
          setIsConnected(false);
          setHeartRate(null);
        }
      }
    }, WATCHDOG_CHECK_INTERVAL_MS);

    return () => clearInterval(watchdog);
  }, [isConnected]); // Only dependency is isConnected to check status

  // Refs to avoid stale closures in listeners
  const heartRateRef = useRef(heartRate);
  const wasEverConnectedRef = useRef(wasEverConnected);

  useEffect(() => {
    heartRateRef.current = heartRate;
  }, [heartRate]);

  useEffect(() => {
    wasEverConnectedRef.current = wasEverConnected;
  }, [wasEverConnected]);

  // Socket Connection
  useEffect(() => {
    if (!elderId || !deviceId) {
      Logger.debug('Skip socket: No elder or no device paired');
      return;
    }

    Logger.info('Connecting to Socket:', CONFIG.SOCKET_URL);

    // Initialize socket if not exists or if URL changed (unlikely)
    // We use a ref to keep the socket instance
    const socket = io(CONFIG.SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    socketRef.current = socket;

    const connectSocket = () => {
      if (!socket.connected) {
        socket.connect();
      }
    };

    socket.on('connect', () => {
      Logger.info('Socket Connected ID:', socket.id);
      socket.emit('authenticate', { elderId });
      setSocketConnected(true);

      if (wasEverConnectedRef.current) {
        Logger.info('Socket reconnected!');
      }
      setWasEverConnected(true);
      // Do NOT set isConnected(true) here. It implies Device Connection, not just Server Connection.
    });

    const handleOffline = (reason: string) => {
      Logger.warn(`Socket Offline (${reason})`);
      setIsConnected(false);
      setSocketConnected(false);
    };

    socket.on('disconnect', (reason) => handleOffline(reason));
    socket.on('connect_error', () => handleOffline('Connect Error'));
    socket.on('reconnect_attempt', () => Logger.debug('Reconnecting...'));

    socket.on('device_status_update', (data) => {
      if (data.elderId === elderId) {
        // ✅ FIXED: Clearer logic
        setIsConnected(data.online === true);
        if (!data.online) {
          setHeartRate(null);
        }
      }
    });

    socket.on('heart_rate_update', (data) => {
      if (data.elderId === elderId) {
        // ✅ FIXED: Only update if value changed
        if (heartRateRef.current !== data.heartRate) {
          setHeartRate(data.heartRate);
        }
        setLastHeartUpdate(new Date(data.timestamp));
        setIsConnected(true);
      }
    });

    socket.on('heart_rate_alert', (data) => {
      if (data.elderId === elderId) {
        // ✅ FIXED: Only update if value changed
        if (heartRateRef.current !== data.heartRate) {
          setHeartRate(data.heartRate);
        }
        setLastHeartUpdate(new Date(data.timestamp));
        setIsConnected(true);
      }
    });

    socket.on('fall_detected', (data) => {
      if (data.elderId === elderId) {
        setFallStatus('FALL');
        setLastFallUpdate(new Date(data.timestamp));
        if (data.id) {
          setActiveFallEventId(data.id);
        }
      }
    });

    socket.on('event_status_changed', (data) => {
      if (data.elderId === elderId && data.status === 'RESOLVED') {
        setFallStatus('NORMAL');
        setLastFallUpdate(new Date(data.timestamp));
        setActiveFallEventId(null);
      }
    });

    // AppState Listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        Logger.info('App has come to the foreground! Checking socket status...');

        if (socket.connected) {
          Logger.info('Socket is already connected. Re-authenticating and forcing UI update.');
          socket.emit('authenticate', { elderId });
          // setIsConnected(true); // REMOVED: Don't assume device is online just because app is foregrounded
        } else {
          Logger.info('Socket is disconnected. Attempting to reconnect...');
          connectSocket();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      Logger.debug('Cleaning up socket');
      subscription.remove();
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, [elderId, deviceId]); // Only reconnect if elderId or deviceId changes (primitives)

  return {
    isConnected,
    socketConnected,
    wasEverConnected,
    fallStatus,
    lastFallUpdate,
    heartRate,
    lastHeartUpdate,
    activeFallEventId,
    setFallStatus,
    setLastFallUpdate,
    setHeartRate,
    setLastHeartUpdate,
    setActiveFallEventId,
    setIsConnected,
  };
};
