import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import Logger from "@/utils/logger";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Success Screen (Register/Reset Password)
// ==========================================
export default function AuthSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signIn } = useAuth();

  const type = params.type as string; // 'register' | 'reset_password'
  const token = params.token as string;

  // Config ตามรูป
  const isReset = type === "reset_password";
  const title = isReset ? "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว" : "ลงทะเบียนสำเร็จ!";
  const description = isReset
    ? "กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ"
    : "ยินดีต้อนรับสู่ FallHelp\nบัญชีของคุณถูกสร้างเรียบร้อยแล้ว";

  const iconColor = "#16AD78"; // สีเขียว
  const titleColor = "#16AD78"; // สีเขียวตามรูป

  const handleContinue = async () => {
    if (type === "register") {
      // Clear previous setup data for fresh start
      try {
        const SecureStore = require("expo-secure-store");
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;

        await SecureStore.deleteItemAsync("setup_elderId");
        await SecureStore.deleteItemAsync("setup_step");
        await SecureStore.deleteItemAsync("setup_deviceId");
        await AsyncStorage.removeItem("setup_step1_form_data");

        // Sign In now
        if (token) {
          await signIn(token);
        }

        // Go to setup flow (empty state)
        // Note: signIn might trigger redirect via AutContext/ProtectedRoute, but router.replace is safe here
        // router.replace("/(setup)/empty-state"); 
        // Let the AuthContext/ProtectedRoute handle the redirect to tabs/setup-empty-state naturally
        // BUT to be explicit and prompt:

        // If we trust useProtectedRoute to catch the signIn state change:
        // We can just rely on that. But manually redirecting is safer UX feedback.
        router.replace("/(setup)/empty-state");
      } catch (error) {
        Logger.warn("Failed to clear setup data", error);
        router.replace("/(setup)/empty-state");
      }
    } else {
      // Login flow
      router.replace("/(auth)/login");
    }
  };

  // Resize icon for better proportion
  return (
    <SafeAreaView className="flex-1 bg-white px-8 justify-between pb-10">
      <View className="flex-1 items-center justify-center">
        {/* Success Icon */}
        <View className="mb-8 items-center justify-center">
          <View
            testID="success-icon"
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: iconColor,
              alignItems: "center",
              justifyContent: "center",
              elevation: 5,
              shadowColor: iconColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <MaterialIcons name="check" size={64} color="white" />
          </View>
        </View>

        {/* Text Content */}
        <Text
          className="font-kanit text-2xl font-bold text-center mb-4"
          style={{ color: titleColor }}
        >
          {title}
        </Text>

        <Text className="font-kanit text-base text-gray-500 text-center leading-6 px-4">
          {description}
        </Text>
      </View>

      {/* Manual Action Button */}
      <View className="w-full">
        <PrimaryButton
          title={isReset ? "เข้าสู่ระบบ" : "เริ่มต้นใช้งาน"}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}
