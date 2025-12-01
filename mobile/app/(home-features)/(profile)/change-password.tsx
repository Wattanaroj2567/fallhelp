import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
const PASSWORD_ICON_SIZE = 24;

export default function ChangePassword() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Focus State
  const [currentFocused, setCurrentFocused] = useState(false);
  const [newFocused, setNewFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Animation Hooks
  const useInputAnimation = (focused: boolean, value: string) => {
    const progress = useDerivedValue(
      () => withTiming(focused || !!value ? 1 : 0, { duration: 200 }),
      [focused, value]
    );

    const containerStyle = useAnimatedStyle(() => ({
      top: interpolate(progress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
      backgroundColor: progress.value > 0.5 ? '#FFFFFF' : 'transparent',
      paddingHorizontal: 4,
      zIndex: 1,
    }));

    const textStyle = useAnimatedStyle(() => ({
      fontSize: interpolate(progress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
      color: focused ? '#16AD78' : '#9CA3AF',
    }));

    return { containerStyle, textStyle };
  };

  const currentAnim = useInputAnimation(currentFocused, currentPassword);
  const newAnim = useInputAnimation(newFocused, newPassword);
  const confirmAnim = useInputAnimation(confirmFocused, confirmPassword);

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว' };
    }
    return { valid: true };
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert('รหัสผ่านไม่ถูกต้อง', validation.message || '');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put('/api/users/password', {
        currentPassword,
        newPassword,
      });

      Alert.alert(
        'สำเร็จ',
        'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      Alert.alert('ข้อผิดพลาด', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="text-gray-900">
          อัปเดตรหัสผ่าน
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6">
            {/* Current Password */}
            <View className="mb-6">
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${currentFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, currentAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[currentAnim.textStyle]}>รหัสผ่านปัจจุบัน</Animated.Text>
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
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  onFocus={() => setCurrentFocused(true)}
                  onBlur={() => setCurrentFocused(false)}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                    size={PASSWORD_ICON_SIZE}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View className="mb-6">
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${newFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, newAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[newAnim.textStyle]}>รหัสผ่านใหม่</Animated.Text>
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
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setNewFocused(true)}
                  onBlur={() => setNewFocused(false)}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showNew ? 'eye-outline' : 'eye-off-outline'}
                    size={PASSWORD_ICON_SIZE}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${confirmFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, confirmAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[confirmAnim.textStyle]}>ยืนยันรหัสผ่านใหม่</Animated.Text>
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
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                    size={PASSWORD_ICON_SIZE}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
              <Text style={{ fontSize: 12, fontWeight: '600' }} className="font-kanit text-blue-700 mb-2">
                ข้อกำหนดรหัสผ่าน:
              </Text>
              <View className="flex-row items-start mb-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 mr-2">•</Text>
                <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1">
                  ใช้ตัวอักษร 8 ตัวขึ้นไป
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 mr-2">•</Text>
                <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1">
                  มีตัวเลขอย่างน้อย 1 ตัวและตัวพิเศษอื่นๆ
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-[#16AD78] rounded-2xl py-4 items-center"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  ยืนยันข้อมูล
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
