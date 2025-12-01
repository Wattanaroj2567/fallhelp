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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/services/authService';
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
const THEME_COLOR = '#EB6A6A'; // สีปุ่มตามรูป

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Reset Password Screen
// ==========================================
export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, code } = params;

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage password inputs
  // ==========================================
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================
  const passProgress = useDerivedValue(() => withTiming(passFocused || !!newPassword ? 1 : 0, { duration: 200 }), [passFocused, newPassword]);
  const passLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(passProgress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: passProgress.value > 0.5 ? '#FFFFFF' : 'transparent',
  }));
  const passTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(passProgress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: passFocused ? THEME_COLOR : '#9CA3AF'
  }));

  const confirmProgress = useDerivedValue(() => withTiming(confirmFocused || !!confirmPassword ? 1 : 0, { duration: 200 }), [confirmFocused, confirmPassword]);
  const confirmLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(confirmProgress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: confirmProgress.value > 0.5 ? '#FFFFFF' : 'transparent',
  }));
  const confirmTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(confirmProgress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: confirmFocused ? THEME_COLOR : '#9CA3AF'
  }));

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Reset password API call
  // ==========================================
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return await resetPassword({
        email: email as string,
        code: code as string,
        newPassword
      });
    },
    onSuccess: () => {
      router.replace({
        pathname: '/(auth)/success',
        params: { type: 'reset_password' }
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      Alert.alert('ผิดพลาด', message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกรหัสผ่านใหม่ให้ครบถ้วน');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านยืนยันให้ตรงกัน');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    resetPasswordMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render reset password form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 40, flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          <Text className="font-kanit" style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 12 }}>
            ตั้งรหัสผ่านใหม่
          </Text>
          <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 40 }}>
            สร้างรหัสผ่านใหม่ของคุณ เพื่อเข้าสู่ระบบในครั้งถัดไป
          </Text>

          <View className="w-full max-w-md mx-auto space-y-6">

            {/* New Password Input */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${passFocused ? `border-[${THEME_COLOR}]` : 'border-gray-300'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, paddingHorizontal: 4, zIndex: 1 }, passLabelStyle]}>
                  <Animated.Text className="font-kanit" style={[passTextStyle]}>รหัสผ่านใหม่</Animated.Text>
                </Animated.View>
                <TextInput
                  className="flex-1 font-kanit text-gray-900 text-[16px] pr-10"
                  style={{
                    fontFamily: 'Kanit',
                    paddingTop: 18,
                    paddingBottom: 18,
                    height: '100%',
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                    lineHeight: 24,
                  }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - 24 / 2, zIndex: 10 }}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Requirements Text (From Image) */}
              <View className="mt-2 ml-2">
                <Text className="font-kanit" style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>
                  • อย่างน้อย 8 ตัวอักษร
                </Text>
                <Text className="font-kanit" style={{ fontSize: 12, color: '#6B7280' }}>
                  • มีตัวอักษรพิมพ์ใหญ่-เล็กและตัวเลข
                </Text>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 40 }}>
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${confirmFocused ? `border-[${THEME_COLOR}]` : 'border-gray-300'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, paddingHorizontal: 4, zIndex: 1 }, confirmLabelStyle]}>
                  <Animated.Text className="font-kanit" style={[confirmTextStyle]}>ยืนยันรหัสผ่าน</Animated.Text>
                </Animated.View>
                <TextInput
                  className="flex-1 font-kanit text-gray-900 text-[16px] pr-10"
                  style={{
                    fontFamily: 'Kanit',
                    paddingTop: 18,
                    paddingBottom: 18,
                    height: '100%',
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                    lineHeight: 24,
                  }}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - 24 / 2, zIndex: 10 }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-full py-4 items-center shadow-sm ${resetPasswordMutation.isPending ? 'opacity-70' : ''}`}
              style={{ backgroundColor: THEME_COLOR }}
              onPress={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-kanit" style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>
                  บันทึกรหัสผ่านใหม่
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}