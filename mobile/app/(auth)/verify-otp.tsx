import React, { useState, useRef, useEffect } from "react";
import { TextInput, TouchableOpacity, View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, requestOtp } from "@/services/authService";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { showErrorMessage } from "@/utils/errorHelper";

const THEME_COLOR = "#16AD78"; // สีเขียวตามภาพ
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60; // 1 นาที

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Verify OTP Screen
// ==========================================
export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const initialReferenceCode = params.referenceCode as string;
  const initialExpiresInMinutes = Number(params.expiresInMinutes) || 5;

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage OTP input and timer
  // ==========================================
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [expiryTimer, setExpiryTimer] = useState(initialExpiresInMinutes * 60); // วินาที
  const [referenceCode, setReferenceCode] = useState(initialReferenceCode || "");

  const inputRef = useRef<TextInput>(null);

  // ==========================================
  // ⚙️ LAYER: Logic (Timer)
  // Purpose: Countdown timer for resend and expiry
  // ==========================================
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 🎮 LAYER: Logic (Auto-Verify)
  // Purpose: Auto-submit when OTP is complete
  // ==========================================
  const handleCodeChange = (text: string) => {
    const numericCode = text.replace(/[^0-9]/g, "");
    if (numericCode.length <= OTP_LENGTH) {
      setCode(numericCode);

      // Auto-verify when code is complete
      if (numericCode.length === OTP_LENGTH) {
        handleAutoVerify(numericCode);
      }
    }
  };

  const handleAutoVerify = async (otpCode: string) => {
    try {
      await verifyOtp({ email, code: otpCode, purpose: "PASSWORD_RESET" });
      // Success - navigate to reset password
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, code: otpCode },
      });
    } catch (error: any) {
      // Error - show nice alert and clear input
      Alert.alert(
        "รหัสไม่ถูกต้อง",
        "รหัส OTP ที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง",
        [
          {
            text: "ลองใหม่",
            onPress: () => {
              setCode("");
              inputRef.current?.focus();
            },
          },
        ]
      );
    }
  };

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Resend OTP
  // ==========================================

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      return await requestOtp({ email, purpose: "PASSWORD_RESET" });
    },
    onSuccess: (data) => {
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setExpiryTimer(data.expiresInMinutes * 60);
      setReferenceCode(data.referenceCode);
      Alert.alert("ส่งรหัสใหม่แล้ว", "กรุณาตรวจสอบอีเมล");
    },
    onError: (error: any) => {
      showErrorMessage("ผิดพลาด", error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user actions
  // ==========================================
  const handleVerify = () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกรหัสให้ครบ 6 หลัก");
      return;
    }
    handleAutoVerify(code);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    resendOtpMutation.mutate();
  };

  // Format timers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render OTP verification form
  // ==========================================
  return (
    <ScreenWrapper
      useScrollView={false}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 40,
        flex: 1,
      }}
      header={<ScreenHeader title="" onBack={router.back} />}
    >
      <View>
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 16 }}
        >
          ตั้งรหัสผ่านใหม่
        </Text>

        {/* Email Info */}
        <Text className="font-kanit text-gray-600" style={{ fontSize: 15 }}>
          กรอกรหัสที่ระบบส่งไปที่ {email}
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 14, marginBottom: 32 }}
        >
          รหัสมีอายุ 5 นาที
        </Text>

        {/* OTP Inputs - Underline Style */}
        <View className="items-center mb-6">
          <TextInput
            ref={inputRef}
            testID="otp-input"
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            className="w-0 h-0 opacity-0"
            autoFocus={true}
          />

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            className="flex-row justify-center gap-3"
            testID="otp-boxes"
          >
            {[...Array(OTP_LENGTH)].map((_, index) => {
              const hasValue = index < code.length;
              const isActive = index === code.length;
              return (
                <View
                  key={index}
                  className="items-center justify-end"
                  style={{ width: 40, height: 50 }}
                >
                  <Text
                    className="font-kanit text-gray-900"
                    style={{ fontSize: 24, marginBottom: 4 }}
                  >
                    {hasValue ? code[index] : ""}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      width: "100%",
                      backgroundColor: hasValue
                        ? THEME_COLOR
                        : isActive
                          ? "#9CA3AF"
                          : "#E5E7EB",
                      borderRadius: 2,
                    }}
                  />
                </View>
              );
            })}
          </TouchableOpacity>
        </View>

        {/* Reference Code & Expiry */}
        <View className="items-center mb-6">
          {referenceCode && (
            <Text
              className="font-kanit text-gray-700 font-semibold"
              style={{ fontSize: 15, marginBottom: 4 }}
            >
              รหัสอ้างอิง: {referenceCode}
            </Text>
          )}
          <Text className="font-kanit text-gray-500" style={{ fontSize: 13 }}>
            รหัสมีผล {Math.ceil(expiryTimer / 60)} นาทีก่อนหมดอายุ
          </Text>

          {/* Resend Timer */}
          <View className="flex-row items-center mt-4">
            {resendTimer > 0 ? (
              <Text className="font-kanit text-gray-400" style={{ fontSize: 14 }}>
                ส่งรหัสใหม่อีกครั้งใน {formatTime(resendTimer)} นาที
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} testID="resend-button">
                <Text
                  className="font-kanit font-semibold"
                  style={{ color: THEME_COLOR, fontSize: 14 }}
                >
                  ส่งรหัสอีกครั้ง
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          testID="verify-button"
          title="ยืนยัน"
          onPress={handleVerify}
          disabled={code.length !== OTP_LENGTH}
        />
      </View>
    </ScreenWrapper>
  );
}
