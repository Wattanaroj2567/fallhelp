import React, { useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Success Screen for Setup Flow
// ==========================================
export default function SetupSuccess() {
  const router = useRouter();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Clear setup_step to mark setup as complete
    const clearSetupState = async () => {
      try {
        await SecureStore.deleteItemAsync("setup_step");
      } catch (error) {
        console.warn("Failed to clear setup step", error);
      }
    };
    clearSetupState();

    // Animate checkmark entrance, then start pulse loop
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Start looping pulse animation after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleGoToHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#059669' }}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon with Animation */}
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ],
          }}
          className="mb-8"
        >
          <View className="w-32 h-32 rounded-full bg-white items-center justify-center shadow-2xl">
            <View className="w-28 h-28 rounded-full bg-green-50 items-center justify-center">
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="items-center mb-12"
        >
          <Text
            className="font-kanit text-white text-4xl font-bold mb-3 text-center"
            style={{ lineHeight: 56 }}
          >
            สำเร็จ!
          </Text>
          <Text className="font-kanit text-white/90 text-lg text-center mb-2">
            ตั้งค่าเรียบร้อยแล้ว
          </Text>
          <Text className="font-kanit text-white/80 text-base text-center max-w-[280px]">
            ระบบพร้อมใช้งานแล้ว คุณสามารถเริ่มดูแลผู้สูงอายุได้ทันที
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="w-full max-w-sm"
        >
          {/* Primary Button */}
          <TouchableOpacity
            onPress={handleGoToHome}
            className="bg-white rounded-2xl py-4 px-8 mb-4 shadow-lg active:scale-95"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Text className="font-kanit text-green-600 text-lg font-semibold mr-2">
                ไปที่หน้าหลัก
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#059669" />
            </View>
          </TouchableOpacity>

          {/* Feature Highlights */}
          <View className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <Text className="font-kanit text-white text-sm font-semibold mb-3 text-center">
              คุณสามารถทำได้ทันที:
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={18} color="white" />
                <Text className="font-kanit text-white/90 text-sm ml-2">
                  รับการแจ้งเตือนเมื่อเกิดเหตุการณ์
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="pulse" size={18} color="white" />
                <Text className="font-kanit text-white/90 text-sm ml-2">
                  ติดตามสุขภาพแบบเรียลไทม์
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="people" size={18} color="white" />
                <Text className="font-kanit text-white/90 text-sm ml-2">
                  จัดการข้อมูลผู้สูงอายุ
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
