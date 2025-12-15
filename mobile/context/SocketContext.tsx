import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/Config';
import Logger from '@/utils/logger';

// Constants
const STALE_HEARTBEAT_THRESHOLD_MS = 60_000; // 60 seconds (increased from 20s to prevent false offline on nav)
const WATCHDOG_CHECK_INTERVAL_MS = 5_000; // 5 seconds

// ==========================================
// Types
// ==========================================
interface SocketContextType {
  // Connection State
  isConnected: boolean;
  socketConnected: boolean;
  wasEverConnected: boolean;
  // Device Data
  fallStatus: 'NORMAL' | 'FALL' | null;
  lastFallUpdate: Date | null;
  heartRate: number | null;
  lastHeartUpdate: Date | null;
  activeFallEventId: string | null;
  // Setters (for external updates like initialEvents sync)
  setFallStatus: (status: 'NORMAL' | 'FALL' | null) => void;
  setLastFallUpdate: (date: Date | null) => void;
  setHeartRate: (rate: number | null) => void;
  setLastHeartUpdate: (date: Date | null) => void;
  setActiveFallEventId: (id: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  // Actions
  reconnect: () => void;
  // Configuration
  setElderConfig: (elderId: string | undefined, deviceId: string | undefined) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socketConnected: false,
  wasEverConnected: false,
  fallStatus: null,
  lastFallUpdate: null,
  heartRate: null,
  lastHeartUpdate: null,
  activeFallEventId: null,
  setFallStatus: () => {},
  setLastFallUpdate: () => {},
  setHeartRate: () => {},
  setLastHeartUpdate: () => {},
  setActiveFallEventId: () => {},
  setIsConnected: () => {},
  reconnect: () => {},
  setElderConfig: () => {},
});

export const useSocketContext = () => useContext(SocketContext);

// ==========================================
// Provider Component
// ==========================================
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Configuration (set by Dashboard when elder data is available)
  const [elderId, setElderId] = useState<string | undefined>(undefined);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [wasEverConnected, setWasEverConnected] = useState(false);

  // Device Data
  const [fallStatus, setFallStatus] = useState<'NORMAL' | 'FALL' | null>(null);
  const [lastFallUpdate, setLastFallUpdate] = useState<Date | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [lastHeartUpdate, setLastHeartUpdate] = useState<Date | null>(null);
  const [activeFallEventId, setActiveFallEventId] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const appState = useRef(AppState.currentState);
  const lastHeartUpdateRef = useRef<Date | null>(null);
  const heartRateRef = useRef(heartRate);
  const wasEverConnectedRef = useRef(wasEverConnected);

  // Sync refs with state
  useEffect(() => {
    lastHeartUpdateRef.current = lastHeartUpdate;
  }, [lastHeartUpdate]);

  useEffect(() => {
    heartRateRef.current = heartRate;
  }, [heartRate]);

  useEffect(() => {
    wasEverConnectedRef.current = wasEverConnected;
  }, [wasEverConnected]);

  // Configuration setter
  const setElderConfig = useCallback(
    (newElderId: string | undefined, newDeviceId: string | undefined) => {
      setElderId(newElderId);
      setDeviceId(newDeviceId);
    },
    [],
  );

  // Watchdog: Check for stale data
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (lastHeartUpdateRef.current) {
        const now = new Date();
        const diff = now.getTime() - lastHeartUpdateRef.current.getTime();

        if (diff > STALE_HEARTBEAT_THRESHOLD_MS && isConnected) {
          Logger.warn('Data stale: No heart rate update for 20s. Marking as offline.');
          setIsConnected(false);
          setHeartRate(null);
        }
      }
    }, WATCHDOG_CHECK_INTERVAL_MS);

    return () => clearInterval(watchdog);
  }, [isConnected]);

  // Socket Connection
  useEffect(() => {
    if (!elderId || !deviceId) {
      Logger.debug('[SocketContext] Skip socket: No elder or no device paired');
      return;
    }

    Logger.info('[SocketContext] Connecting to Socket:', CONFIG.SOCKET_URL);

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
      Logger.info('[SocketContext] Socket Connected ID:', socket.id);
      socket.emit('authenticate', { elderId });
      setSocketConnected(true);

      if (wasEverConnectedRef.current) {
        Logger.info('[SocketContext] Socket reconnected!');
      }
      setWasEverConnected(true);
    });

    const handleOffline = (reason: string) => {
      Logger.warn(`[SocketContext] Socket Offline (${reason})`);
      setIsConnected(false);
      setSocketConnected(false);
    };

    socket.on('disconnect', (reason) => handleOffline(reason));
    socket.on('connect_error', () => handleOffline('Connect Error'));
    socket.on('reconnect_attempt', () => Logger.debug('[SocketContext] Reconnecting...'));

    socket.on('device_status_update', (data) => {
      if (data.elderId === elderId) {
        Logger.info('[SocketContext] device_status_update received', { online: data.online });
        setIsConnected(data.online === true);
        if (!data.online) {
          setHeartRate(null);
        }
      }
    });

    socket.on('heart_rate_update', (data) => {
      if (data.elderId === elderId) {
        Logger.info('[SocketContext] heart_rate_update received', { heartRate: data.heartRate });
        if (heartRateRef.current !== data.heartRate) {
          setHeartRate(data.heartRate);
        }
        setLastHeartUpdate(new Date(data.timestamp));
        setIsConnected(true);
      }
    });

    socket.on('heart_rate_alert', (data) => {
      if (data.elderId === elderId) {
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
        Logger.info('[SocketContext] App has come to the foreground!');

        if (socket.connected) {
          Logger.info('[SocketContext] Socket is connected. Re-authenticating.');
          socket.emit('authenticate', { elderId });
        } else {
          Logger.info('[SocketContext] Socket is disconnected. Reconnecting...');
          connectSocket();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      Logger.debug('[SocketContext] Cleaning up socket');
      subscription.remove();
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, [elderId, deviceId]);

  // Reconnect function
  const reconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket && elderId) {
      if (socket.connected) {
        socket.emit('authenticate', { elderId });
        Logger.info('[SocketContext] Re-authenticating socket');
      } else {
        socket.connect();
        Logger.info('[SocketContext] Reconnecting socket');
      }
    }
  }, [elderId]);

  return (
    <SocketContext.Provider
      value={{
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
        reconnect,
        setElderConfig,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
