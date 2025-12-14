import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
// import { Image } from 'expo-image';
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { NotificationModal } from "@/components/NotificationModal";
import { ConnectionToast } from "@/components/ConnectionToast";
import { Bounceable } from "@/components/Bounceable";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserElders as getElders, getProfile } from "@/services/userService";
import { listEvents, cancelEvent } from "@/services/eventService";
import { getUnreadCount } from "@/services/notificationService";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthContext";
import Logger from "@/utils/logger";

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Pure functions for data formatting
// ==========================================
const formatTime = (date: Date | null) => {
  if (!date) return "--:-- น.";
  return (
    date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) +
    " น."
  );
};

const calculateAge = (dobString?: string) => {
  if (!dobString) return "--";
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
  const [showConnectionToast, setShowConnectionToast] = useState(false);
  const [connectionToastState, setConnectionToastState] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const { top } = useSafeAreaInsets();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder Data & Initial Events using React Query
  // ==========================================

  // 1. Fetch Elder Profile
  const {
    data: elderInfo,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userElders"],
    queryFn: async () => {
      const elders = await getElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
    enabled: isSignedIn, // Only fetch when logged in
  });

  // 1.5. Fetch User Profile (for profile image)
  const { data: userProfile, refetch: refetchUserProfile } = useQuery({
    queryKey: ["userProfile"],
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
      // Invalidate ALL queries to force fresh data (especially device status)
      queryClient.invalidateQueries({ queryKey: ["userElders"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["initialEvents"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    }, [queryClient])
  );

  // 2. Fetch Initial Events (for initial state before socket updates)
  const { data: initialEvents } = useQuery({
    queryKey: ["initialEvents", elderInfo?.id],
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
    queryKey: ["unreadCount"],
    queryFn: async () => {
      try {
        const count = await getUnreadCount();
        return count ?? 0; // Ensure we return 0 instead of undefined
      } catch (error) {
        Logger.warn("Failed to fetch unread count:", error);
        return 0;
      }
    },
    enabled: isSignedIn, // Only fetch when logged in
    refetchInterval: 30000, // Poll every 30 seconds
    retry: 1,
    staleTime: 10000,
  });

  // ==========================================
  // 🔌 LAYER: Logic (Real-time / Side Effects)
  // Purpose: Handle Socket.IO connection and updates
  // ==========================================
  const {
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
  } = useSocket(elderInfo?.id, elderInfo?.device?.id);

  // Handle Connection Toast visibility
  useEffect(() => {
    if (!wasEverConnected) return; // Don't show on first connect
    
    if (!socketConnected) {
      setConnectionToastState('disconnected');
      setShowConnectionToast(true);
    } else {
      setConnectionToastState('connected');
      setShowConnectionToast(true);
    }
  }, [socketConnected, wasEverConnected]);



  // Sync Initial Event Data
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      const latestHR = initialEvents.find((e) =>
        ["HEART_RATE_NORMAL", "HEART_RATE_HIGH", "HEART_RATE_LOW"].includes(
          e.type
        )
      );
      if (latestHR && latestHR.value) {
        setHeartRate(latestHR.value);
        setLastHeartUpdate(new Date(latestHR.timestamp));
      }

      const latestFall = initialEvents.find((e) => e.type === "FALL");
      if (latestFall) {
        setLastFallUpdate(new Date(latestFall.timestamp));
        setFallStatus(latestFall.isCancelled ? "NORMAL" : "FALL");
        if (!latestFall.isCancelled) {
          setActiveFallEventId(latestFall.id);
        }
      } else {
        setFallStatus("NORMAL");
      }
    }
  }, [
    initialEvents,
    setHeartRate,
    setLastHeartUpdate,
    setFallStatus,
    setLastFallUpdate,
    setActiveFallEventId,
  ]);

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user interactions
  // ==========================================
  // Removed onRefresh as we auto-refresh on focus now

  const handleResetStatus = async () => {
    if (!activeFallEventId) return;
    try {
      await cancelEvent(activeFallEventId);
      setFallStatus("NORMAL");
      setActiveFallEventId(null);
      Alert.alert("สำเร็จ", "รีเซ็ตสถานะเรียบร้อยแล้ว");
    } catch (error) {
      Alert.alert("ผิดพลาด", "ไม่สามารถรีเซ็ตสถานะได้");
      Logger.error("Failed to reset fall status:", error);
    }
  };

  // UI Logic: Calculate Status Colors/Labels
  const hrStatus = (() => {
    if (heartRate === null) return { label: "--", color: "#9CA3AF" };
    if (heartRate < 60) return { label: "ต่ำกว่าเกณฑ์", color: "#1E88E5" };
    if (heartRate > 100) return { label: "สูงกว่าปกติ", color: "#EF4A5A" };
    return { label: "ปกติ", color: "#4A90E2" };
  })();

  const getFallStatusColor = () => {
    if (fallStatus === "FALL") return "#EF4A5A";
    if (isConnected) return "#4A90E2";
    return "#9CA3AF";
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
          withTiming(1, { duration: Math.max(0, beatDuration - 250) }) // Rest
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(heartScale);
      heartScale.value = withTiming(1);
    }
  }, [heartRate]);

  // ==========================================
  // 🖼️ LAYER: View (Render)
  // Purpose: Render the UI JSX
  // ==========================================

  // Show loading spinner while checking elder data
  if (isLoading) {
    return (
      <ScreenWrapper
        edges={["top"]}
        useScrollView={false}
        style={{ backgroundColor: "#FDFDFD" }}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="mt-4 text-gray-500 font-kanit">กำลังโหลด...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // If no elder data, don't render (useProtectedRoute will redirect)
  if (!elderInfo) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Connection Toast */}
      <ConnectionToast
        state={connectionToastState}
        visible={showConnectionToast}
        onHide={() => setShowConnectionToast(false)}
      />
      
      <ScreenWrapper
        edges={["left", "right"]}
        useScrollView={false}
        style={{ backgroundColor: "#FFFFFF" }}
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
              <MaterialIcons
                name="notifications-none"
                size={28}
                color="#374151"
              />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Bounceable>

            <Bounceable
              onPress={() => router.push("/(features)/(user)/(profile)")}
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
        </View >

        <View className="flex-1 px-5 pt-6 pb-4 justify-between">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#16AD78" />
              <Text className="font-kanit text-gray-500 mt-4">
                กำลังโหลดข้อมูล...
              </Text>
            </View>
          ) : elderInfo ? (
            // Main Dashboard UI
            <>
              <View>
                {/* Section Title */}
                <Text className="text-lg font-kanit font-bold text-gray-800 ml-1 mb-5">
                  ภาพรวม
                </Text>

                {/* Fall Status Card (Hero - Colorful with Border) */}
                {/* Fall Status Card (Hero - 3D Card Style) */}
                <View
                  className={`px-6 py-10 rounded-[28px] mb-6 border bg-white shadow-sm ${fallStatus === "FALL" ? "border-red-100" : "border-gray-100"
                    }`}
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center gap-4">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center ${fallStatus === "FALL"
                          ? "bg-red-100"
                          : isConnected
                            ? "bg-blue-50"
                            : "bg-gray-100"
                          }`}
                      >
                        <MaterialIcons
                          name={
                            fallStatus === "FALL"
                              ? "warning"
                              : isConnected
                                ? "accessibility"
                                : "signal-wifi-off"
                          }
                          size={28}
                          color={
                            fallStatus === "FALL"
                              ? "#EF4444"
                              : isConnected
                                ? "#3B82F6"
                                : "#9CA3AF"
                          }
                        />
                      </View>
                      <View>
                        <Text className="text-gray-400 font-kanit text-sm mb-0.5">
                          สถานะการหกล้ม
                        </Text>
                        <Text
                          className={`font-kanit font-bold text-2xl ${fallStatus === "FALL"
                            ? "text-red-500"
                            : isConnected
                              ? "text-gray-900"
                              : "text-gray-400"
                            }`}
                        >
                          {fallStatus === "FALL"
                            ? "ตรวจพบ!"
                            : isConnected
                              ? "ปกติ"
                              : "-"}
                        </Text>
                      </View>
                    </View>
                    {fallStatus === "FALL" && (
                      <View className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        <Text className="text-xs text-red-600 font-kanit font-bold">
                          ฉุกเฉิน
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row justify-between items-end">
                    <Text className="text-gray-400 font-kanit text-xs">
                      อัปเดตล่าสุด : {formatTime(lastFallUpdate)}
                    </Text>

                    {fallStatus === "FALL" && (
                      <Bounceable
                        onPress={handleResetStatus}
                        className="bg-red-500 px-5 py-2.5 rounded-xl shadow-sm"
                        scale={0.95}
                      >
                        <Text className="text-white font-kanit font-bold text-sm">
                          รีเซ็ตสถานะ
                        </Text>
                      </Bounceable>
                    )}
                  </View>
                </View>

                {/* Grid: Device & Heart Rate */}
                <View className="flex-row mb-6">
                  <Bounceable
                    onPress={() => router.push("/(features)/(device)/details")}
                    className="flex-1 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm mr-1.5"
                    scale={0.95}
                  >
                    <View className="flex-row justify-between items-start">
                      <View
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${!elderInfo?.device
                          ? "bg-gray-100"
                          : isConnected
                            ? "bg-green-100"
                            : "bg-red-100"
                          }`}
                      >
                        <MaterialIcons
                          name="devices"
                          size={24}
                          color={
                            !elderInfo?.device
                              ? "#9CA3AF"
                              : isConnected
                                ? "#16AD78"
                                : "#EF4444"
                          }
                        />
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`w-3 h-3 rounded-full ${!elderInfo?.device
                            ? "bg-gray-300"
                            : isConnected
                              ? "bg-green-500"
                              : "bg-red-500"
                            }`}
                        />
                        <MaterialIcons name="chevron-right" size={28} color="#9CA3AF" />
                      </View>
                    </View>

                    <View className="mt-4">
                      <Text className="text-gray-400 font-kanit text-xs mb-1">
                        อุปกรณ์
                      </Text>
                      <Text
                        className={`text-lg font-kanit font-bold ${!elderInfo?.device
                          ? "text-gray-400"
                          : isConnected
                            ? "text-gray-800"
                            : "text-red-500"
                          }`}
                      >
                        {!elderInfo?.device ? "ไม่มีอุปกรณ์" : isConnected ? "ออนไลน์" : "ออฟไลน์"}
                      </Text>
                    </View>
                  </Bounceable>

                  {/* Heart Rate */}
                  <View className="flex-1 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm ml-1.5">
                    <View className="flex-row justify-between items-start">
                      <Animated.View
                        style={heartAnimatedStyle}
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${isConnected ? "bg-rose-100" : "bg-gray-100"
                          }`}
                      >
                        <MaterialIcons
                          name="favorite"
                          size={24}
                          color={isConnected ? "#E11D48" : "#9CA3AF"}
                        />
                      </Animated.View>
                      {(heartRate || 0) > 0 &&
                        ((heartRate || 0) < 60 || (heartRate || 0) > 100) ? (
                        <View
                          className={`px-2 py-1 rounded-md ${(heartRate || 0) > 100 ? "bg-red-100" : "bg-blue-100"
                            }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${(heartRate || 0) > 100
                              ? "text-red-600"
                              : "text-blue-600"
                              }`}
                          >
                            {(heartRate || 0) > 100 ? "สูง" : "ต่ำ"}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View className="mt-4">
                      <Text className="text-gray-400 font-kanit text-xs mb-1">
                        ชีพจร
                      </Text>
                      <View className="flex-row items-baseline">
                        <Text
                          className={`text-3xl font-kanit font-bold mr-1 ${isConnected ? "text-gray-800" : "text-gray-400"
                            }`}
                        >
                          {heartRate && isConnected ? heartRate : "--"}
                        </Text>
                        <Text className="text-xs text-gray-400 font-kanit">
                          BPM
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Elder Info Card (Clickable) */}
                {/* Elder Info Card (Clickable) */}
                <Bounceable
                  onPress={() => router.push("/(features)/(elder)")}
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
                        <MaterialIcons
                          name="elderly"
                          size={40}
                          color="#4A90E2"
                        />
                      )}
                    </View>
                    <View>
                      <Text className="text-gray-400 font-kanit text-xs mb-1.5">
                        ผู้สูงอายุที่ดูแล
                      </Text>
                      <Text className="text-xl font-kanit font-bold text-gray-800 mb-2">
                        {(() => {
                          const first = elderInfo?.firstName?.trim() || "";
                          const last = elderInfo?.lastName?.trim() || "";
                          const full = `${first} ${last}`.trim();
                          return full || "ยังไม่มีข้อมูลผู้สูงอายุ";
                        })()}
                      </Text>
                      <View className="flex-row space-x-2">
                        <View
                          className={`px-3 py-1 rounded-full ${elderInfo?.gender === "MALE"
                            ? "bg-blue-100"
                            : elderInfo?.gender === "FEMALE"
                              ? "bg-pink-100"
                              : "bg-gray-100"
                            }`}
                        >
                          <Text
                            className={`text-xs font-bold font-kanit ${elderInfo?.gender === "MALE"
                              ? "text-blue-600"
                              : elderInfo?.gender === "FEMALE"
                                ? "text-pink-600"
                                : "text-gray-600"
                              }`}
                          >
                            {elderInfo?.gender === "MALE"
                              ? "ชาย"
                              : elderInfo?.gender === "FEMALE"
                                ? "หญิง"
                                : "ไม่ระบุ"}
                          </Text>
                        </View>
                        <View className="bg-gray-100 px-3 py-1 rounded-full">
                          <Text className="text-xs text-gray-600 font-kanit font-bold">
                            {elderInfo?.dateOfBirth
                              ? calculateAge(elderInfo.dateOfBirth.toString())
                              : "--"}{" "}
                            ปี
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={32}
                    color="#9CA3AF"
                  />
                </Bounceable>
              </View>
            </>
          ) : null}
        </View>

        {/* Emergency Call Button - Fixed at Bottom */}
        {elderInfo && (
          <View className="px-5 pb-0">
            <Bounceable
              onPress={() => router.push("/(features)/(emergency)/call")}
              className="bg-[#FF4B4B] rounded-t-[35px] rounded-b-none p-5 flex-row justify-center items-center shadow-lg shadow-red-200"
              scale={0.97}
            >
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <MaterialIcons name="phone-in-talk" size={24} color="white" />
              </View>
              <Text className="text-white font-kanit font-bold text-xl">
                โทรฉุกเฉิน
              </Text>
            </Bounceable>
          </View>
        )}
      </ScreenWrapper>
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View >
  );
}
