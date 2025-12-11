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
import { useRouter, useFocusEffect, Link } from "expo-router";
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
import * as SecureStore from "expo-secure-store";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

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
  });

  // 1.5. Fetch User Profile (for profile image)
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });

  // Reset error state when profile image changes
  useEffect(() => {
    setImageError(false);
  }, [userProfile?.profileImage]);

  // Refetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Invalidate all relevant queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userElders"] });
      queryClient.invalidateQueries({ queryKey: ["initialEvents"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

      // Also trigger refetch to ensure data is fresh
      refetch();
    }, [queryClient, refetch])
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
        console.warn("Failed to fetch unread count:", error);
        return 0;
      }
    },
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
    <ScreenWrapper
      edges={["top"]}
      useScrollView={false}
      style={{ backgroundColor: "#FDFDFD" }}
    >
      {/* Header Section */}
      <View className="flex-row items-center justify-between pt-3 pb-4 bg-white px-6 border-b border-gray-100">
        <View>
          <Text className="text-sm text-gray-500 font-kanit">สวัสดี, คุณ</Text>
          <Text className="text-xl font-kanit font-bold text-gray-800">
            {userProfile?.firstName}
          </Text>
        </View>

        <View className="flex-row items-center gap-5">
          <Link href="/(features)/(monitoring)/notifications" asChild>
            <TouchableOpacity className="p-1 relative">
              <MaterialIcons
                name="notifications-none"
                size={28}
                color="#374151"
              />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </TouchableOpacity>
          </Link>

          <Link href="/(features)/(user)/(profile)" asChild>
            <TouchableOpacity className="rounded-full overflow-hidden">
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
            </TouchableOpacity>
          </Link>
        </View>
      </View>

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

              {/* Fall Status Card (Hero - Colorful) */}
              <View
                className={`p-6 rounded-[24px] shadow-md mb-6 ${fallStatus === "FALL"
                  ? "bg-red-500"
                  : isConnected
                    ? "bg-[#4A90E2]"
                    : "bg-gray-400"
                  }`}
              >
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm">
                      <MaterialIcons
                        name={
                          fallStatus === "FALL"
                            ? "warning"
                            : isConnected
                              ? "accessibility"
                              : "signal-wifi-off"
                        }
                        size={28}
                        color="white"
                      />
                    </View>
                    <View>
                      <Text className="text-white/80 font-kanit text-sm mb-0.5">
                        สถานะการหกล้ม
                      </Text>
                      <Text className="text-white font-kanit font-bold text-2xl">
                        {fallStatus === "FALL" ? "ตรวจพบ!" : (isConnected ? "ปกติ" : "-")}
                      </Text>
                    </View>
                  </View>
                  {fallStatus === "FALL" && (
                    <View className="bg-white px-3 py-1 rounded-full">
                      <Text className="text-xs text-red-600 font-kanit font-bold">
                        ฉุกเฉิน
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between items-end">
                  <Text className="text-white/70 font-kanit text-xs">
                    อัปเดตล่าสุด : {formatTime(lastFallUpdate)}
                  </Text>

                  {fallStatus === "FALL" && (
                    <TouchableOpacity
                      onPress={handleResetStatus}
                      className="bg-white px-5 py-2.5 rounded-xl shadow-sm active:bg-gray-100"
                    >
                      <Text className="text-red-500 font-kanit font-bold text-sm">
                        รีเซ็ตสถานะ
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Grid: Device & Heart Rate */}
              <View className="flex-row mb-6">
                <TouchableOpacity
                  onPress={() => {
                    if (elderInfo?.device) {
                      router.push("/(features)/(device)/details");
                    } else {
                      router.push("/(features)/(device)/pairing");
                    }
                  }}
                  className="flex-1 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm mr-1.5 active:bg-gray-50"
                >
                  <View className="flex-row justify-between items-start">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${isConnected ? "bg-green-100" : "bg-gray-100"
                        }`}
                    >
                      <MaterialIcons
                        name="devices"
                        size={24}
                        color={isConnected ? "#16AD78" : "#9CA3AF"}
                      />
                    </View>
                    <View className="flex-row items-start gap-1">
                      <View
                        className={`w-3 h-3 rounded-full mt-1 ${isConnected ? "bg-green-500" : "bg-gray-300"
                          }`}
                      />
                      <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                    </View>
                  </View>

                  <View className="mt-4">
                    <Text className="text-gray-400 font-kanit text-xs mb-1">
                      อุปกรณ์
                    </Text>
                    <Text
                      className={`text-lg font-kanit font-bold ${isConnected ? "text-gray-800" : "text-gray-400"
                        }`}
                    >
                      {isConnected ? "ออนไลน์" : "ออฟไลน์"}
                    </Text>
                  </View>
                </TouchableOpacity>

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
              <Link href="/(features)/(elder)" asChild>
                <TouchableOpacity className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center justify-between active:bg-gray-50">
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
                  <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Emergency Call Button - Docked to Bottom */}
            <Link href="/(features)/(emergency)/call" asChild>
              <TouchableOpacity className="bg-[#FF4B4B] rounded-[24px] p-5 flex-row justify-center items-center shadow-lg shadow-red-200 active:bg-red-600 mt-4">
                <View className="bg-white/20 p-2 rounded-full mr-3">
                  <MaterialIcons name="phone-in-talk" size={24} color="white" />
                </View>
                <Text className="text-white font-kanit font-bold text-xl">
                  โทรฉุกเฉิน
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
