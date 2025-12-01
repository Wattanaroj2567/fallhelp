import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { requestOtp } from '@/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
// สีปุ่มตามรูปภาพอ้างอิง (สีแดงอมชมพู/ส้ม)
const BUTTON_COLOR = '#EB6A6A';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Forgot Password Screen
// ==========================================
export default function ForgotPasswordScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  const router = useRouter();

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================
  const emailProgress = useDerivedValue(
    () => withTiming(emailFocused || !!email ? 1 : 0, { duration: 200 }),
    [emailFocused, email]
  );

  const emailLabelContainerStyle = useAnimatedStyle(() => ({
    top: interpolate(emailProgress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: emailProgress.value > 0.5 ? '#FFFFFF' : 'transparent',
  }));

  const emailLabelTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(emailProgress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: emailFocused ? BUTTON_COLOR : '#9CA3AF',
  }));

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Request OTP for password reset
  // ==========================================
  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      return await requestOtp({ email, purpose: 'PASSWORD_RESET' });
    },
    onSuccess: () => {
      Alert.alert('ส่งรหัสสำเร็จ', `รหัส OTP ถูกส่งไปยัง ${email} แล้ว`, [
        {
          text: 'ตกลง',
          onPress: () => {
            // ส่ง email ไปยังหน้าถัดไปเพื่อใช้ verify
            router.push({
              pathname: '/(auth)/verify-otp',
              params: { email }
            });
          }
        }
      ]);
    },
    onError: (error: any) => {
      console.error('Request OTP error:', error);
      const message = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการส่ง OTP';
      Alert.alert('ส่งรหัสไม่สำเร็จ', message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกอีเมลของคุณ');
      return;
    }
    if (emailError) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
      return;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('รูปแบบไม่ถูกต้อง', 'กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    requestOtpMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render forgot password form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="font-kanit text-xl font-bold text-gray-900">
          ลืมรหัสผ่าน
        </Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Description Section */}
            <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>
              กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน{'\n'}
              ระบบจะส่งรหัส OTP 6 หลักไปยังอีเมลคุณ
            </Text>

            {/* Form Section */}
            <View className="w-full max-w-md mx-auto">

              {/* Email Input with Floating Label */}
              <View className="mb-8">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        left: 16,
                        paddingHorizontal: 4,
                        zIndex: 1,
                      },
                      emailLabelContainerStyle,
                    ]}
                  >
                    <Animated.Text className="font-kanit" style={[emailLabelTextStyle]}>
                      อีเมล
                    </Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${emailFocused ? `border-[${BUTTON_COLOR}]` : emailError ? 'border-red-500' : 'border-gray-300'
                      } bg-white text-gray-900 text-[16px]`}
                    style={{ borderColor: emailFocused ? BUTTON_COLOR : emailError ? '#EF4444' : '#E5E7EB', borderWidth: 1, height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center' }}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (/[ก-๙]/.test(text)) {
                        setEmailError('กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
                      } else {
                        setEmailError('');
                      }
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? (
                  <Text className="font-kanit text-red-500 text-xs mt-1 ml-2">{emailError}</Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-2xl py-4 items-center shadow-sm ${requestOtpMutation.isPending ? 'opacity-70' : ''}`}
                style={{ backgroundColor: BUTTON_COLOR }}
                onPress={handleSendOtp}
                disabled={requestOtpMutation.isPending}
                activeOpacity={0.8}
              >
                {requestOtpMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-kanit" style={{ fontSize: 17, color: '#FFFFFF', fontWeight: '600' }}>
                    ส่งรหัส OTP
                  </Text>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}