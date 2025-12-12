import React, { useState, useRef, useEffect } from "react";
import { TextInput, TouchableOpacity, View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, requestOtp } from "@/services/authService";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { showErrorMessage } from "@/utils/errorHelper";

const THEME_COLOR = "#EB6A6A"; // สีตามรูปภาพ (Coral/Red)
const OTP_LENGTH = 6;

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Verify OTP Screen
// ==========================================
export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage OTP input and timer
  // ==========================================
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(15); // ตามรูปภาพ 0:15 น.

  const inputRef = useRef<TextInput>(null);

  // ==========================================
  // ⚙️ LAYER: Logic (Timer)
  // Purpose: Countdown timer for resend OTP
  // ==========================================
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCodeChange = (text: string) => {
    const numericCode = text.replace(/[^0-9]/g, "");
    if (numericCode.length <= OTP_LENGTH) {
      setCode(numericCode);
    }
  };

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Verify OTP and Resend OTP
  // ==========================================
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      return await verifyOtp({ email, code, purpose: "PASSWORD_RESET" });
    },
    onSuccess: () => {
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, code },
      });
    },
    onError: (error: any) => {
      showErrorMessage("ผิดพลาด", error);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      return await requestOtp({ email, purpose: "PASSWORD_RESET" });
    },
    onSuccess: () => {
      setTimer(15);
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
  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกรหัสให้ครบ 6 หลัก");
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    resendOtpMutation.mutate();
  };

  // Format timer as M:SS
  const formattedTimer = `0:${timer.toString().padStart(2, "0")}`;

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render OTP verification form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{
        paddingHorizontal: 32,
        paddingBottom: 100,
        flexGrow: 1,
      }}
      header={<ScreenHeader title="" onBack={router.back} />}
    >
      <View className="items-center w-full">
        {/* Header Text */}
        <Text className="font-kanit text-3xl font-bold text-gray-800 text-center mb-6">
          OTP
        </Text>

        <Text className="font-kanit text-sm text-gray-500 text-center leading-6">
          เราได้ส่งรหัสยืนยัน (OTP) ไปยังอีเมลของคุณ
        </Text>
        <Text className="font-kanit text-sm text-gray-500 text-center mb-8">
          {email}
        </Text>

        {/* Card Container for Inputs */}
        <View className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 mb-8 w-full">
          <Text className="font-kanit text-sm text-gray-500 text-center mb-6">
            กรุณากรอกรหัส 6 หลัก ด้านล่างเพื่อดำเนินการต่อ
          </Text>

          {/* OTP Inputs */}
          <View className="items-center w-full mb-6">
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
              className="flex-row justify-center gap-2"
              testID="otp-boxes"
            >
              {[...Array(OTP_LENGTH)].map((_, index) => {
                const hasValue = index < code.length;
                return (
                  <View
                    key={index}
                    className={`w-[40px] h-[50px] border rounded-xl items-center justify-center ${
                      hasValue
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className="font-kanit text-2xl text-gray-800">
                      {hasValue ? code[index] : ""}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>
          </View>

          {/* Resend Timer */}
          <View className="flex-row justify-center items-center">
            <Text className="font-kanit text-gray-500 text-sm">
              ไม่ได้รับ OTP ?{" "}
            </Text>
            {timer > 0 ? (
              <Text className="font-kanit text-gray-400 text-sm">
                รอ {formattedTimer} เพื่อส่งอีกครั้ง
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} testID="resend-button">
                <Text
                  className="font-kanit font-bold underline"
                  style={{ color: THEME_COLOR }}
                >
                  ส่งรหัสอีกครั้ง
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View className="w-full">
          <PrimaryButton
            testID="verify-button"
            title="ยืนยัน"
            onPress={handleVerify}
            loading={verifyOtpMutation.isPending}
            style={{ backgroundColor: THEME_COLOR }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
