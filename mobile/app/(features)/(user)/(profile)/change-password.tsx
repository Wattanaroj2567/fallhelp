import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Logger from '@/utils/logger';
import { MaterialIcons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getErrorMessage } from '@/utils/errorHelper';

export default function ChangePassword() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Animation Hooks


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
      Logger.error('Error changing password:', error);
      const message = getErrorMessage(error);
      Alert.alert('ข้อผิดพลาด', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      useScrollView={false}
      header={<ScreenHeader title="" onBack={() => router.back()} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          เปลี่ยนรหัสผ่าน
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          กรุณากรอกรหัสผ่านปัจจุบันและใหม่
        </Text>

        {/* Current Password */}
        <View>
          <FloatingLabelInput
            label="รหัสผ่านปัจจุบัน"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            isPassword
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        {/* New Password */}
        <View>
          <FloatingLabelInput
            label="รหัสผ่านใหม่"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        {/* Confirm Password */}
        <View>
          <FloatingLabelInput
            label="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        {/* Password Strength Bar - Show when typing */}
        {newPassword.length > 0 && (() => {
          // Calculate strength (0-4)
          let strength = 0;
          if (newPassword.length >= 8) strength++;
          if (/[A-Z]/.test(newPassword)) strength++;
          if (/[a-z]/.test(newPassword)) strength++;
          if (/[0-9]/.test(newPassword)) strength++;

          // Get strength config
          const strengthConfig = {
            0: { label: "กรอกรหัสผ่าน", color: "#E5E7EB", textColor: "#9CA3AF" },
            1: { label: "อ่อนมาก", color: "#EF4444", textColor: "#EF4444" },
            2: { label: "อ่อน", color: "#F97316", textColor: "#F97316" },
            3: { label: "ปานกลาง", color: "#EAB308", textColor: "#EAB308" },
            4: { label: "แข็งแรง", color: "#16AD78", textColor: "#16AD78" },
          }[strength] || { label: "", color: "#E5E7EB", textColor: "#9CA3AF" };

          return (
            <View className="mb-8">
              {/* Strength Label */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-kanit" style={{ fontSize: 12, color: "#6B7280" }}>
                  ความแข็งแรงของรหัสผ่าน
                </Text>
                <Text className="font-kanit font-semibold" style={{ fontSize: 12, color: strengthConfig.textColor }}>
                  {strengthConfig.label}
                </Text>
              </View>

              {/* Strength Bar */}
              <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${(strength / 4) * 100}%`, backgroundColor: strengthConfig.color, borderRadius: 3 }} />
              </View>

              {/* Requirements Dots */}
              <View className="flex-row justify-between mt-3">
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: newPassword.length >= 8 ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                  <Text className="font-kanit" style={{ fontSize: 13, color: newPassword.length >= 8 ? "#16AD78" : "#9CA3AF" }}>8+ ตัว</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[A-Z]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                  <Text className="font-kanit" style={{ fontSize: 13, color: /[A-Z]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>A-Z</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[a-z]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                  <Text className="font-kanit" style={{ fontSize: 13, color: /[a-z]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>a-z</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[0-9]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                  <Text className="font-kanit" style={{ fontSize: 13, color: /[0-9]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>0-9</Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Save Button */}
        <PrimaryButton
          title="บันทึกข้อมูล"
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </ScreenWrapper>
  );
}
