import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/Config';

export const useSocket = (elderId: string | undefined, deviceId: string | undefined) => {
    const [isConnected, setIsConnected] = useState(false);
    const [fallStatus, setFallStatus] = useState<'NORMAL' | 'FALL' | null>(null);
    const [lastFallUpdate, setLastFallUpdate] = useState<Date | null>(null);
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [lastHeartUpdate, setLastHeartUpdate] = useState<Date | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const appState = useRef(AppState.currentState);

    // Watchdog: Check for stale data
    useEffect(() => {
        const watchdog = setInterval(() => {
            if (isConnected && lastHeartUpdate) {
                const now = new Date();
                const diff = now.getTime() - lastHeartUpdate.getTime();

                if (diff > 30000) { // 30 seconds
                    console.log('⚠️ Data stale: No heart rate update for 30s. Assuming offline.');
                    setIsConnected(false);
                    setHeartRate(null);
                }
            }
        }, 5000);

        return () => clearInterval(watchdog);
    }, [isConnected, lastHeartUpdate]);

    // Socket Connection
    useEffect(() => {
        if (!elderId || !deviceId) {
            console.log('⏭️ Skip socket: No elder or no device paired');
            return;
        }

        console.log('🔌 Connecting to Socket:', CONFIG.SOCKET_URL);

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
            console.log('✅ Socket Connected ID:', socket.id);
            socket.emit('authenticate', { elderId });
            setIsConnected(true);
        });

        const handleOffline = (reason: string) => {
            console.log(`❌ Socket Offline (${reason})`);
            setIsConnected(false);
        };

        socket.on('disconnect', (reason) => handleOffline(reason));
        socket.on('connect_error', () => handleOffline('Connect Error'));
        socket.on('reconnect_attempt', () => console.log('Reconnecting...'));

        socket.on('device_status_update', (data) => {
            if (data.elderId === elderId) {
                setIsConnected(data.online === true);
                if (!data.online) {
                    setHeartRate(null);
                }
            }
        });

        socket.on('heart_rate_update', (data) => {
            if (data.elderId === elderId) {
                setHeartRate(data.heartRate);
                setLastHeartUpdate(new Date(data.timestamp));
                setIsConnected(true);
            }
        });

        socket.on('heart_rate_alert', (data) => {
            if (data.elderId === elderId) {
                setHeartRate(data.heartRate);
                setLastHeartUpdate(new Date(data.timestamp));
                setIsConnected(true);
            }
        });

        socket.on('fall_detected', (data) => {
            if (data.elderId === elderId) {
                setFallStatus('FALL');
                setLastFallUpdate(new Date(data.timestamp));
            }
        });

        socket.on('event_status_changed', (data) => {
            if (data.elderId === elderId && data.status === 'RESOLVED') {
                setFallStatus('NORMAL');
                setLastFallUpdate(new Date(data.timestamp));
            }
        });

        // AppState Listener
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('📱 App has come to the foreground! Reconnecting socket...');
                connectSocket();
            }
            appState.current = nextAppState;
        });

        return () => {
            console.log('🧹 Cleaning up socket');
            subscription.remove();
            socket.disconnect();
            socket.removeAllListeners();
            socketRef.current = null;
        };
    }, [elderId, deviceId]); // Only reconnect if elderId or deviceId changes (primitives)

    return {
        isConnected,
        fallStatus,
        lastFallUpdate,
        heartRate,
        lastHeartUpdate,
        setFallStatus,
        setLastFallUpdate,
        setHeartRate,
        setLastHeartUpdate,
        setIsConnected
    };
};
