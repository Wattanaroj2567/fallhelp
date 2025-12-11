import React, { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/services/authService";
import { getErrorMessage } from "@/utils/errorHelper";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { GenderSelect } from "@/components/GenderSelect";
import { useAuth } from "@/context/AuthContext";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Registration Screen
// ==========================================
export default function RegisterScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { signIn } = useAuth(); // Access auth context

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle registration API call
  // ==========================================
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await register(data);
    },
    onSuccess: async (data) => {
      // Don't sign in immediately to avoid race condition with ProtectedRoute
      // Pass token to Success screen instead

      // Redirect to success screen
      router.replace({
        pathname: "/(auth)/success",
        params: {
          type: "register",
          token: data.token // Pass token for manual sign-in later
        },
      });
    },
    onError: (error: any) => {
      Logger.error("Register error:", error);
      const message = getErrorMessage(error);
      Alert.alert("ลงทะเบียนล้มเหลว", message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !gender) {
      Alert.alert("กรุณากรอกข้อมูล", "โปรดกรอกข้อมูลให้ครบถ้วน รวมถึงเพศ");
      return;
    }
    if (emailError) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
      return;
    }
    if (password.length < 8) {
      Alert.alert("รหัสผ่านไม่ถูกต้อง", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (phone && !/^0\d{9}$/.test(cleanedPhone)) {
      Alert.alert(
        "เบอร์โทรศัพท์ไม่ถูกต้อง",
        "กรอกเฉพาะตัวเลข 10 หลักและขึ้นต้นด้วย 0"
      );
      return;
    }

    const payload = {
      email,
      password,
      firstName,
      lastName,
      gender,
      phone: cleanedPhone || undefined,
    };

    Logger.info("Sending registration payload:", payload);
    registerMutation.mutate(payload);
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render registration form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: false, // iOS: ห้ามเด้งดึ๋ง
        overScrollMode: "never", // Android: ห้ามเด้งแสง
      }}
      scrollViewRef={scrollViewRef} // Pass ref correctly
      header={
        <View>
          <ScreenHeader title="ลงทะเบียน" onBack={router.back} />
          {/* Description - Sticky with header */}
          <View className="px-6 pb-4">
            <Text
              className="font-kanit text-gray-500"
              style={{
                fontSize: 14,
                textAlign: "left",
              }}
            >
              กรุณากรอกรายละเอียดของคุณเพื่อเข้าใช้งาน
            </Text>
          </View>
        </View>
      }
    >
      <View>
        {/* Row 1: Name & Lastname */}
        <View className="flex-row gap-3">
          {/* First Name */}
          <FloatingLabelInput
            testID="firstName-input"
            label="ชื่อ"
            value={firstName}
            onChangeText={setFirstName}
            containerStyle={{ flex: 1 }}
          />

          {/* Last Name */}
          <FloatingLabelInput
            testID="lastName-input"
            label="นามสกุล"
            value={lastName}
            onChangeText={setLastName}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Row 2: Gender */}
        <GenderSelect value={gender} onChange={setGender} />

        {/* Row 3: Phone */}
        <FloatingLabelInput
          testID="phone-input"
          label="เบอร์โทรศัพท์"
          value={phone}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 10) {
              setPhone(cleaned);
            }
          }}
          keyboardType="number-pad"
          maxLength={10}
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Row 4: Email */}
        <FloatingLabelInput
          testID="email-input"
          label="อีเมล"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (/[ก-๙]/.test(text)) {
              setEmailError("กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
            } else {
              setEmailError("");
            }
          }}
          error={emailError}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="email-address"
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Row 5: Password */}
        <FloatingLabelInput
          testID="password-input"
          label="รหัสผ่าน"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (/[ก-๙]/.test(text)) {
              setPasswordError("กรุณากรอกรหัสผ่านเป็นภาษาอังกฤษ");
            } else {
              setPasswordError("");
            }
          }}
          error={passwordError}
          isPassword
          autoCapitalize="none"
          textContentType="password"
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Requirements */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-8">
          <Text
            style={{ fontSize: 12, fontWeight: "600" }}
            className="font-kanit text-blue-700 mb-2"
          >
            ข้อกำหนดรหัสผ่าน:
          </Text>
          <View className="flex-row items-start mb-1">
            <Text
              style={{ fontSize: 12 }}
              className="font-kanit text-blue-700 mr-2"
            >
              •
            </Text>
            <Text
              style={{ fontSize: 12 }}
              className="font-kanit text-blue-700 flex-1"
            >
              อย่างน้อย 8 ตัวอักษร
            </Text>
          </View>
          <View className="flex-row items-start">
            <Text
              style={{ fontSize: 12 }}
              className="font-kanit text-blue-700 mr-2"
            >
              •
            </Text>
            <Text
              style={{ fontSize: 12 }}
              className="font-kanit text-blue-700 flex-1"
            >
              มีตัวอักษรพิมพ์ใหญ่-เล็กและตัวเลข
            </Text>
          </View>
        </View>

        {/* Register Button */}
        <PrimaryButton
          testID="register-button"
          title="ลงทะเบียน"
          onPress={handleRegister}
          loading={registerMutation.isPending}
        />

        {/* Login Link */}
        <View className="flex-row justify-center items-center mt-6">
          <Text
            className="font-kanit text-gray-500"
            style={{ fontSize: 15 }}
          >
            มีบัญชีอยู่แล้ว ?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text
              className="font-kanit font-semibold"
              style={{ fontSize: 15, color: "#EB6A6A" }}
            >
              เข้าสู่ระบบ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
