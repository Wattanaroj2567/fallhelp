import React, { useState } from "react";
import { Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authService";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext"; // Import hook
import { getErrorMessage } from "@/utils/errorHelper";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Login Screen
// ==========================================
export default function LoginScreen() {
  const { signIn, signOut } = useAuth(); // Use context

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs and focus state
  // ==========================================
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await login({ identifier, password });
    },
    onSuccess: async (response) => {
      // ตรวจสอบ role - Admin ไม่ควรใช้ Mobile app
      if (response.user?.role === "ADMIN") {
        Alert.alert(
          "ไม่สามารถเข้าสู่ระบบได้",
          "บัญชีผู้ดูแลระบบ (Admin) ไม่สามารถใช้งานแอปพลิเคชันนี้ได้ กรุณาใช้ Admin Panel แทน",
          [{ text: "ตกลง" }]
        );
        // Force logout via context just in case
        await signOut();
        return;
      }

      Logger.info("Login success, updating context");

      // ✅ CRITICAL FIX: Update Context State FIRST!
      // This will trigger the RootLayout effect to redirect automatically.
      await signIn(response.token);

      Alert.alert("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับกลับ");
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      Logger.error("Login error:", error);
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
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
        flexGrow: 1,
      }}
      scrollViewProps={{ bounces: false }}
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
            testID="email-input"
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
            testID="password-input"
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
            <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500">
              ลืมรหัสผ่าน ?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <PrimaryButton
            testID="login-button"
            title="เข้าสู่ระบบ"
            onPress={handleLogin}
            loading={loginMutation.isPending}
            style={{ marginBottom: 20 }}
          />

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="font-kanit text-gray-500" style={{ fontSize: 14 }}>
              ยังไม่มีบัญชี ?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text
                className="font-kanit text-primary font-semibold"
                style={{ fontSize: 14, color: "#EB6A6A" }}
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
