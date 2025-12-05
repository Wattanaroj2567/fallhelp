import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Login Screen
// ==========================================
export default function LoginScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs and focus state
  // ==========================================
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle login API call
  // ==========================================
  const loginMutation = useMutation({
    mutationFn: async () => {
      // @ts-ignore - API service needs update to accept identifier, but backend handles it
      return await login({ identifier, password });
    },
    onSuccess: (response) => {
      // ตรวจสอบ role - Admin ไม่ควรใช้ Mobile app
      if (response.user?.role === "ADMIN") {
        Alert.alert(
          "ไม่สามารถเข้าสู่ระบบได้",
          "บัญชีผู้ดูแลระบบ (Admin) ไม่สามารถใช้งานแอปพลิเคชันนี้ได้ กรุณาใช้ Admin Panel แทน",
          [{ text: "ตกลง" }]
        );
        // Logout เพื่อลบ token ที่เพิ่ง set ไป
        import("@/services/authService").then(({ logout }) => logout());
        return;
      }

      Alert.alert("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับกลับ");
      Logger.info("Login success, redirecting to dashboard");
      // ✅ FIX: Redirect to tabs root - the initialRouteName="index" in TabLayout will handle the rest
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Logger.error("Login error:", error);
      const message =
        error.response?.data?.message || error.message || "เกิดข้อผิดพลาด";
      Alert.alert("เข้าสู่ระบบล้มเหลว", message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("กรุณากรอกข้อมูล", "โปรดกรอกอีเมล/เบอร์โทรศัพท์และรหัสผ่าน");
      return;
    }
    if (identifierError) {
      Alert.alert(
        "ข้อมูลไม่ถูกต้อง",
        "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ให้ถูกต้อง"
      );
      return;
    }

    loginMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render login form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 40,
      }}
    >
      <View>
        {/* Logo Section */}
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/images/logoicon.png")}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
        </View>

        {/* Form Section */}
        <View className="w-full max-w-md mx-auto">
          {/* Identifier Input with Floating Label */}
          {/* Identifier Input with Floating Label */}
          <FloatingLabelInput
            label="อีเมลหรือเบอร์โทรศัพท์"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              // Simple validation: check if contains Thai characters (invalid for email/phone)
              if (/[ก-๙]/.test(text)) {
                setIdentifierError("กรุณากรอกเป็นภาษาอังกฤษหรือตัวเลข");
              } else {
                setIdentifierError("");
              }
            }}
            error={identifierError}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password Input with Floating Label */}
          {/* Password Input with Floating Label */}
          <FloatingLabelInput
            label="รหัสผ่าน"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            textContentType="password"
          />

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-8"
            onPress={() => router.push("/(auth)/forgot-password")}
            activeOpacity={0.7}
          >
            <Text
              className="font-kanit"
              style={{ fontSize: 14, color: "#6B7280" }}
            >
              ลืมรหัสผ่าน ?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <PrimaryButton
            title="เข้าสู่ระบบ"
            onPress={handleLogin}
            loading={loginMutation.isPending}
            style={{ marginBottom: 20 }}
          />

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text
              className="font-kanit"
              style={{ fontSize: 14, color: "#6B7280" }}
            >
              ยังไม่มีบัญชี ?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text
                className="font-kanit"
                style={{ fontSize: 14, color: "#EB6A6A", fontWeight: "600" }}
              >
                สมัครสมาชิก
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
