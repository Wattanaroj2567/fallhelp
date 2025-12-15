import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Image } from 'react-native';
// import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { NotificationModal } from '@/components/NotificationModal';
import { Bounceable } from '@/components/Bounceable';
import { router, useFocusEffect } from 'expo-router';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserElders as getElders, getProfile } from '@/services/userService';
import { listEvents, cancelEvent } from '@/services/eventService';
import { getUnreadCount } from '@/services/notificationService';
import { useSocketContext } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import Logger from '@/utils/logger';

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Pure functions for data formatting
// ==========================================
const formatTime = (date: Date | null) => {
  if (!date) return '--:-- น.';
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
};

const calculateAge = (dobString?: string) => {
  if (!dobString) return '--';
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Main Dashboard Screen
// ==========================================
export default function Home() {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { top } = useSafeAreaInsets();

  // ==========================================
  // 🔌 LAYER: Logic (Real-time / Side Effects)
  // Purpose: Handle Socket.IO connection and updates (via Global Context)
  // ==========================================
  const {
    isConnected,
    socketConnected: _socketConnected,
    wasEverConnected: _wasEverConnected,
    fallStatus,
    lastFallUpdate,
    heartRate,
    lastHeartUpdate: _lastHeartUpdate,
    activeFallEventId,
    setFallStatus,
    setLastFallUpdate,
    setHeartRate,
    setLastHeartUpdate,
    setActiveFallEventId,
    setIsConnected: _setIsConnected,
    setElderConfig,
  } = useSocketContext();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder Data & Initial Events using React Query
  // ==========================================

  // 1. Fetch Elder Profile
  const {
    data: elderInfo,
    isLoading,
    refetch: _refetch,
  } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
    enabled: isSignedIn, // Only fetch when logged in
  });

  // 1.5. Fetch User Profile (for profile image)
  const { data: userProfile, refetch: _refetchUserProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
    enabled: isSignedIn, // Only fetch when logged in
  });

  // Reset error state when profile image changes
  useEffect(() => {
    setImageError(false);
  }, [userProfile?.profileImage]);

  // Refetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Refetch data in background without invalidating cache (prevents loading flicker)
      queryClient.refetchQueries({ queryKey: ['userElders'] });
      queryClient.refetchQueries({ queryKey: ['userProfile'] });
      // Only refetch events if we are not connected to socket
      // If connected, we trust the live stream and don't want stale API data to override
      if (!isConnected) {
        queryClient.refetchQueries({ queryKey: ['initialEvents'] });
      }
      queryClient.refetchQueries({ queryKey: ['unreadCount'] });
    }, [queryClient, isConnected]),
  );

  // 2. Fetch Initial Events (for initial state before socket updates)
  const { data: initialEvents } = useQuery({
    queryKey: ['initialEvents', elderInfo?.id],
    queryFn: async () => {
      if (!elderInfo?.id) return null;
      const response = await listEvents({
        elderId: elderInfo.id,
        pageSize: 20,
        page: 1,
      });
      return response.data || [];
    },
    enabled: !!elderInfo?.id,
  });

  // 3. Fetch Unread Notification Count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      try {
        const count = await getUnreadCount();
        return count ?? 0; // Ensure we return 0 instead of undefined
      } catch (error) {
        Logger.warn('Failed to fetch unread count:', error);
        return 0;
      }
    },
    enabled: isSignedIn, // Only fetch when logged in
    refetchInterval: 30000, // Poll every 30 seconds
    retry: 1,
    staleTime: 10000,
  });

  // Configure socket with elder/device IDs when available
  useEffect(() => {
    if (elderInfo?.id && elderInfo?.device?.id) {
      setElderConfig(elderInfo.id, elderInfo.device.id);
    }
  }, [elderInfo?.id, elderInfo?.device?.id, setElderConfig]);

  // Sync Initial Event Data
  // Use initialEvents?.length to force re-trigger when data changes
  useEffect(() => {
    // OLD LOGIC REMOVED: if (isConnected) return;
    // We now ALWAYS compare timestamps to ensure we show the freshest data,
    // whether it comes from the socket or a fresh API fetch on focus.

    if (initialEvents && initialEvents.length > 0) {
      // 1. Sync Heart Rate
      const latestHR = initialEvents.find((e) =>
        ['HEART_RATE_NORMAL', 'HEART_RATE_HIGH', 'HEART_RATE_LOW'].includes(e.type),
      );

      if (latestHR && latestHR.value) {
        const eventTime = new Date(latestHR.timestamp).getTime();
        const contextTime = _lastHeartUpdate ? _lastHeartUpdate.getTime() : 0;

        // If API data is newer than Context data, update Context
        if (eventTime > contextTime) {
          Logger.debug('[Dashboard] Syncing newer HR from API', {
            api: eventTime,
            ctx: contextTime,
          });
          setHeartRate(latestHR.value);
          setLastHeartUpdate(new Date(latestHR.timestamp));
          // If data is recent (< 60s), consider connected
          if (Date.now() - eventTime < 60000) {
            _setIsConnected(true);
          }
        }
      }

      // 2. Sync Fall Status
      const latestFall = initialEvents.find((e) => e.type === 'FALL');

      if (latestFall) {
        const eventTime = new Date(latestFall.timestamp).getTime();
        const contextTime = lastFallUpdate ? lastFallUpdate.getTime() : 0;

        if (eventTime > contextTime) {
          Logger.debug('[Dashboard] Syncing newer Fall from API', {
            api: eventTime,
            ctx: contextTime,
          });
          setLastFallUpdate(new Date(latestFall.timestamp));
          setFallStatus(latestFall.isCancelled ? 'NORMAL' : 'FALL');
          if (!latestFall.isCancelled) {
            setActiveFallEventId(latestFall.id);
          }
        }
      } else {
        // Only set to NORMAL if we aren't currently locally tracking a FALL (active socket event)
        // AND if we haven't received a newer fall update via socket
        if (fallStatus !== 'FALL') {
          // Safe to assume normal if API says no fall and we don't have a local fall
          // But actually, "latestFall" being undefined just means no FALL event in the page 1 list.
          // It doesn't mean "Resolved". So we should be careful resetting to NORMAL based on absence.
          // Better to leave existing status alone if no fall event found in API list.
        }
      }

      // 3. Use DEVICE_ONLINE event to determine connection status if no heart rate data
      // Only check this if we aren't currently connected via socket
      if (!isConnected) {
        if (!latestHR || !latestHR.value) {
          const latestDeviceOnline = initialEvents.find((e) => e.type === 'DEVICE_ONLINE');
          if (latestDeviceOnline) {
            const eventTime = new Date(latestDeviceOnline.timestamp).getTime();
            const now = Date.now();
            const timeDiff = now - eventTime;
            const THIRTY_SECONDS = 30 * 1000;
            const isValidTimestamp = eventTime > 946684800000;

            if (isValidTimestamp && timeDiff < THIRTY_SECONDS) {
              _setIsConnected(true);
            } else if (!isValidTimestamp) {
              if (elderInfo?.device?.lastOnline) {
                const lastOnlineTime = new Date(elderInfo.device.lastOnline).getTime();
                const lastOnlineDiff = now - lastOnlineTime;
                if (lastOnlineDiff < THIRTY_SECONDS) {
                  _setIsConnected(true);
                } else {
                  _setIsConnected(false);
                }
              }
            } else {
              _setIsConnected(false);
            }
          } else {
            if (elderInfo?.device?.lastOnline) {
              const lastOnlineTime = new Date(elderInfo.device.lastOnline).getTime();
              const lastOnlineDiff = Date.now() - lastOnlineTime;
              const THIRTY_SECONDS = 30 * 1000;
              if (lastOnlineDiff < THIRTY_SECONDS) {
                _setIsConnected(true);
              } else {
                _setIsConnected(false);
              }
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    initialEvents?.length, // Use length to force re-trigger when data changes
    initialEvents, // Keep initialEvents for accessing data
    elderInfo?.device?.lastOnline, // Include device lastOnline to check connection
    setHeartRate,
    setLastHeartUpdate,
    setFallStatus,
    setLastFallUpdate,
    setActiveFallEventId,
    _setIsConnected,
  ]); // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user interactions
  // ==========================================
  // Removed onRefresh as we auto-refresh on focus now

  const handleResetStatus = async () => {
    if (!activeFallEventId) return;
    try {
      await cancelEvent(activeFallEventId);
      setFallStatus('NORMAL');
      setActiveFallEventId(null);
      Alert.alert('สำเร็จ', 'รีเซ็ตสถานะเรียบร้อยแล้ว');
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถรีเซ็ตสถานะได้');
      Logger.error('Failed to reset fall status:', error);
    }
  };

  // UI Logic: Calculate Status Colors/Labels
  const _hrStatus = (() => {
    if (heartRate === null) return { label: '--', color: '#9CA3AF' };
    if (heartRate < 60) return { label: 'ต่ำกว่าเกณฑ์', color: '#1E88E5' };
    if (heartRate > 100) return { label: 'สูงกว่าปกติ', color: '#EF4A5A' };
    return { label: 'ปกติ', color: '#4A90E2' };
  })();

  const _getFallStatusColor = () => {
    if (fallStatus === 'FALL') return '#EF4A5A';
    if (isConnected) return '#4A90E2';
    return '#9CA3AF';
  };

  // Animation Logic
  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  useEffect(() => {
    if (heartRate && heartRate > 0) {
      // Calculate duration per beat in ms (60000ms / BPM)
      // Subtracting a small buffer for the contraction phase
      const beatDuration = 60000 / heartRate;

      // Standard Heartbeat Pattern:
      // 1. Systole (Contraction/Pump): Fast expansion
      // 2. Diastole (Relaxation): Fast return to normal
      // 3. Rest: Wait for the next beat

      // Reset animation
      cancelAnimation(heartScale);
      heartScale.value = 1;

      heartScale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 100, easing: Easing.out(Easing.quad) }), // Pump
          withTiming(1, { duration: 150, easing: Easing.in(Easing.quad) }), // Relax
          withTiming(1, { duration: Math.max(0, beatDuration - 250) }), // Rest
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(heartScale);
      heartScale.value = withTiming(1);
    }
  }, [heartRate, heartScale]);

  // ==========================================
  // 🖼️ LAYER: View (Render)
  // Purpose: Render the UI JSX
  // ==========================================  // Show loading spinner while checking elder data
  if (isLoading) {
    return <LoadingScreen useScreenWrapper={true} message="กำลังโหลดข้อมูล..." />;
  } // If no elder data, don't render (useProtectedRoute will redirect)
  if (!elderInfo) {
    return null;
  }
  return (
    <View className="flex-1 bg-white">
      <ScreenWrapper
        edges={['left', 'right']}
        useScrollView={false}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Header Section (Floating 3D Card) */}
        <View
          style={{ paddingTop: top + 12 }}
          className="flex-row items-center justify-between pb-6 bg-white px-6 rounded-b-[32px] shadow-sm z-10 mb-2"
        >
          <View>
            <Text className="text-base text-gray-500 font-kanit">สวัสดี, คุณ</Text>
            <Text className="text-2xl font-kanit font-bold text-gray-800">
              {userProfile?.firstName}
            </Text>
          </View>
          <View className="flex-row items-center gap-5">
            <Bounceable
              onPress={() => setShowNotifications(true)}
              className="p-1 relative"
              scale={0.9}
            >
              <MaterialIcons name="notifications-none" size={28} color="#374151" />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Bounceable>
            <Bounceable
              onPress={() => router.push('/(features)/(user)/(profile)')}
              className="rounded-full overflow-hidden"
              scale={0.9}
            >
              {userProfile?.profileImage && !imageError ? (
                <Image
                  key={userProfile?.profileImage} // Force re-render on change
                  source={{ uri: userProfile.profileImage }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View
                  style={{ width: 48, height: 48 }}
                  className="bg-gray-200 items-center justify-center rounded-full"
                >
                  <MaterialIcons name="person" size={28} color="#9CA3AF" />
                </View>
              )}
            </Bounceable>
          </View>
        </View>

        <View className="flex-1 px-5 pt-6 pb-4 justify-between">
          {isLoading ? (
            <LoadingScreen useScreenWrapper={false} message="กำลังโหลดข้อมูล..." />
          ) : elderInfo ? (
            // Main Dashboard UI
            <>
              <View>
                {/* Section Title */}
                <Text className="text-lg font-kanit font-bold text-gray-800 ml-1 mb-5">ภาพรวม</Text>

                {/* Fall Status Card (Hero - Colorful with Border) */}
                {/* Fall Status Card (Hero - 3D Card Style) */}
                <View
                  className={`px-6 py-10 rounded-[28px] mb-6 border bg-white shadow-sm ${
                    fallStatus === 'FALL' ? 'border-red-100' : 'border-gray-100'
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center gap-4">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                          fallStatus === 'FALL'
                            ? 'bg-red-100'
                            : isConnected
                              ? 'bg-blue-50'
                              : 'bg-gray-100'
                        }`}
                      >
                        <MaterialIcons
                          name={
                            fallStatus === 'FALL'
                              ? 'warning'
                              : isConnected
                                ? 'accessibility'
                                : 'signal-wifi-off'
                          }
                          size={28}
                          color={
                            fallStatus === 'FALL' ? '#EF4444' : isConnected ? '#3B82F6' : '#9CA3AF'
                          }
                        />
                      </View>
                      <View>
                        <Text className="text-gray-400 font-kanit text-sm mb-0.5">
                          สถานะการหกล้ม
                        </Text>
                        <Text
                          className={`font-kanit font-bold text-2xl ${
                            fallStatus === 'FALL'
                              ? 'text-red-500'
                              : isConnected
                                ? 'text-gray-900'
                                : 'text-gray-400'
                          }`}
                        >
                          {fallStatus === 'FALL' ? 'ตรวจพบ!' : isConnected ? 'ปกติ' : '-'}
                        </Text>
                      </View>
                    </View>
                    {fallStatus === 'FALL' && (
                      <View className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        <Text className="text-xs text-red-600 font-kanit font-bold">ฉุกเฉิน</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row justify-between items-end">
                    <Text className="text-gray-400 font-kanit text-xs">
                      อัปเดตล่าสุด : {formatTime(lastFallUpdate)}
                    </Text>

                    {fallStatus === 'FALL' && (
                      <Bounceable
                        onPress={handleResetStatus}
                        className="bg-red-500 px-5 py-2.5 rounded-xl shadow-sm"
                        scale={0.95}
                      >
                        <Text className="text-white font-kanit font-bold text-sm">รีเซ็ตสถานะ</Text>
                      </Bounceable>
                    )}
                  </View>
                </View>

                {/* Grid: Device & Heart Rate */}
                <View className="flex-row mb-6">
                  <Bounceable
                    onPress={() => router.push('/(features)/(device)/details')}
                    className="flex-1 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm mr-1.5"
                    scale={0.95}
                  >
                    <View className="flex-row justify-between items-start">
                      <View
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${
                          !elderInfo?.device
                            ? 'bg-gray-100'
                            : isConnected
                              ? 'bg-green-100'
                              : 'bg-red-100'
                        }`}
                      >
                        <MaterialIcons
                          name="devices"
                          size={24}
                          color={
                            !elderInfo?.device ? '#9CA3AF' : isConnected ? '#16AD78' : '#EF4444'
                          }
                        />
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`w-3 h-3 rounded-full ${
                            !elderInfo?.device
                              ? 'bg-gray-300'
                              : isConnected
                                ? 'bg-green-500'
                                : 'bg-red-500'
                          }`}
                        />
                        <MaterialIcons name="chevron-right" size={28} color="#9CA3AF" />
                      </View>
                    </View>

                    <View className="mt-4">
                      <Text className="text-gray-400 font-kanit text-xs mb-1">อุปกรณ์</Text>
                      <Text
                        className={`text-lg font-kanit font-bold ${
                          !elderInfo?.device
                            ? 'text-gray-400'
                            : isConnected
                              ? 'text-gray-800'
                              : 'text-red-500'
                        }`}
                      >
                        {!elderInfo?.device ? 'ไม่มีอุปกรณ์' : isConnected ? 'ออนไลน์' : 'ออฟไลน์'}
                      </Text>
                    </View>
                  </Bounceable>

                  {/* Heart Rate */}
                  <View className="flex-1 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm ml-1.5">
                    <View className="flex-row justify-between items-start">
                      <Animated.View
                        style={heartAnimatedStyle}
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${
                          isConnected ? 'bg-rose-100' : 'bg-gray-100'
                        }`}
                      >
                        <MaterialIcons
                          name="favorite"
                          size={24}
                          color={isConnected ? '#E11D48' : '#9CA3AF'}
                        />
                      </Animated.View>
                      {(heartRate || 0) > 0 && ((heartRate || 0) < 60 || (heartRate || 0) > 100) ? (
                        <View
                          className={`px-2 py-1 rounded-md ${
                            (heartRate || 0) > 100 ? 'bg-red-100' : 'bg-blue-100'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              (heartRate || 0) > 100 ? 'text-red-600' : 'text-blue-600'
                            }`}
                          >
                            {(heartRate || 0) > 100 ? 'สูง' : 'ต่ำ'}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View className="mt-4">
                      <Text className="text-gray-400 font-kanit text-xs mb-1">ชีพจร</Text>
                      <View className="flex-row items-baseline">
                        <Text
                          className={`text-3xl font-kanit font-bold mr-1 ${
                            isConnected ? 'text-gray-800' : 'text-gray-400'
                          }`}
                        >
                          {heartRate && isConnected ? heartRate : '--'}
                        </Text>
                        <Text className="text-xs text-gray-400 font-kanit">BPM</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Elder Info Card (Clickable) */}
                {/* Elder Info Card (Clickable) */}
                <Bounceable
                  onPress={() => router.push('/(features)/(elder)')}
                  className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center justify-between"
                  scale={0.95}
                >
                  <View className="flex-row items-center gap-5">
                    <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center border border-blue-100 overflow-hidden shadow-sm">
                      {elderInfo?.profileImage ? (
                        <Image
                          source={{ uri: elderInfo.profileImage }}
                          className="w-full h-full rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialIcons name="elderly" size={40} color="#4A90E2" />
                      )}
                    </View>
                    <View>
                      <Text className="text-gray-400 font-kanit text-xs mb-1.5">
                        ผู้สูงอายุที่ดูแล
                      </Text>
                      <Text className="text-xl font-kanit font-bold text-gray-800 mb-2">
                        {(() => {
                          const first = elderInfo?.firstName?.trim() || '';
                          const last = elderInfo?.lastName?.trim() || '';
                          const full = `${first} ${last}`.trim();
                          return full || 'ยังไม่มีข้อมูลผู้สูงอายุ';
                        })()}
                      </Text>
                      <View className="flex-row space-x-2">
                        <View
                          className={`px-3 py-1 rounded-full ${
                            elderInfo?.gender === 'MALE'
                              ? 'bg-blue-100'
                              : elderInfo?.gender === 'FEMALE'
                                ? 'bg-pink-100'
                                : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold font-kanit ${
                              elderInfo?.gender === 'MALE'
                                ? 'text-blue-600'
                                : elderInfo?.gender === 'FEMALE'
                                  ? 'text-pink-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {elderInfo?.gender === 'MALE'
                              ? 'ชาย'
                              : elderInfo?.gender === 'FEMALE'
                                ? 'หญิง'
                                : 'ไม่ระบุ'}
                          </Text>
                        </View>
                        <View className="bg-gray-100 px-3 py-1 rounded-full">
                          <Text className="text-xs text-gray-600 font-kanit font-bold">
                            {elderInfo?.dateOfBirth
                              ? calculateAge(elderInfo.dateOfBirth.toString())
                              : '--'}{' '}
                            ปี
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={32} color="#9CA3AF" />
                </Bounceable>
              </View>
            </>
          ) : null}
        </View>

        {/* Emergency Call Button - Fixed at Bottom */}
        {elderInfo && (
          <View className="px-5 pb-0">
            <Bounceable
              onPress={() => router.push('/(features)/(emergency)/call')}
              className="bg-[#FF4B4B] rounded-t-[35px] rounded-b-none p-5 flex-row justify-center items-center shadow-lg shadow-red-200"
              scale={0.97}
            >
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <MaterialIcons name="phone-in-talk" size={24} color="white" />
              </View>
              <Text className="text-white font-kanit font-bold text-xl">โทรฉุกเฉิน</Text>
            </Bounceable>
          </View>
        )}
      </ScreenWrapper>
      <NotificationModal visible={showNotifications} onClose={() => setShowNotifications(false)} />
    </View>
  );
}
