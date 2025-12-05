import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Alert,
  StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { verifyOtp, requestOtp } from '@/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const THEME_COLOR = '#EB6A6A'; // สีตามรูปภาพ (Coral/Red)
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
  const [code, setCode] = useState('');
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
    const numericCode = text.replace(/[^0-9]/g, '');
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
      // ใน Production ต้องเปิดบรรทัดนี้เพื่อยิง API จริง
      // return await verifyOtp({ email, code, purpose: 'PASSWORD_RESET' });

      // Mock ผ่านไปก่อนเพื่อทดสอบ UI (หรือถ้า API พร้อมแล้วก็ใช้ได้เลย)
      // return new Promise((resolve) => setTimeout(resolve, 1000));

      // Assuming we want to use the real API if available, but the original code had it commented out.
      // I will keep the original logic structure but wrapped in mutation.
      // If the user intends to mock, I'll simulate success.
      return await verifyOtp({ email, code, purpose: 'PASSWORD_RESET' });
    },
    onSuccess: () => {
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, code }
      });
    },
    onError: (error: any) => {
      // If API fails, show error.
      // Note: If we are mocking, this won't be reached unless we throw.
      Alert.alert('ผิดพลาด', error.response?.data?.message || 'รหัส OTP ไม่ถูกต้อง');
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      return await requestOtp({ email, purpose: 'PASSWORD_RESET' });
    },
    onSuccess: () => {
      setTimer(15);
      Alert.alert('ส่งรหัสใหม่แล้ว', 'กรุณาตรวจสอบอีเมล');
    },
    onError: () => {
      Alert.alert('ผิดพลาด', 'ไม่สามารถส่งรหัสได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user actions
  // ==========================================
  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกรหัสให้ครบ 6 หลัก');
      return;
    }

    // For now, since the original code mocked it, let's see if we should really call API.
    // The original code had `await verifyOtp` commented out.
    // But `verifyOtp` is imported.
    // I will uncomment it for the mutation to be useful, assuming the backend is ready.
    // If it fails, the user will see an error, which is correct behavior.
    verifyOtpMutation.mutate();
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    resendOtpMutation.mutate();
  };

  // Format timer as M:SS
  const formattedTimer = `0:${timer.toString().padStart(2, '0')}`;

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render OTP verification form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-2">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 20, flexGrow: 1, paddingBottom: 100 }}
          keyboardDismissMode="on-drag"
        >

          {/* Header Text */}
          <Text className="font-kanit" style={{ fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 24 }}>
            OTP
          </Text>

          <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
            เราได้ส่งรหัสยืนยัน (OTP) ไปยังอีเมลของคุณ
          </Text>
          <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
            {email}
          </Text>

          <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30 }}>
            กรุณากรอกรหัส 6 หลัก ด้านล่างเพื่อดำเนินการต่อ
          </Text>

          {/* OTP Inputs */}
          <View className="mb-12 items-center">
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={{ width: 0, height: 0, opacity: 0 }}
              autoFocus={true}
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}
            >
              {[...Array(OTP_LENGTH)].map((_, index) => {
                const hasValue = index < code.length;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      hasValue ? styles.otpBoxFilled : styles.otpBoxEmpty
                    ]}
                  >
                    <Text className="font-kanit" style={styles.otpText}>
                      {hasValue ? code[index] : ''}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>
          </View>

          {/* Resend Timer */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="font-kanit" style={{ color: '#6B7280', fontSize: 14 }}>
              ไม่ได้รับ OTP ?{' '}
            </Text>
            {timer > 0 ? (
              <Text className="font-kanit" style={{ color: '#9CA3AF', fontSize: 14 }}>
                รอ {formattedTimer} เพื่อส่งอีกครั้ง
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text className="font-kanit" style={{ color: THEME_COLOR, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                  ส่งรหัสอีกครั้ง
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-full py-4 items-center ${verifyOtpMutation.isPending ? 'opacity-70' : ''}`}
            style={{ backgroundColor: THEME_COLOR }}
            onPress={handleVerify}
            disabled={verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-kanit" style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>
                ยืนยัน
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxEmpty: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#E5E7EB', // ในรูปเป็นสีเทาอ่อนแม้จะพิมพ์แล้ว
    backgroundColor: '#FFFFFF',
  },
  otpText: {

    fontSize: 24,
    color: '#333',
  },
});