import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '@/services/api';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { showErrorMessage } from '@/utils/errorHelper';

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

      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: unknown) {
      showErrorMessage('ข้อผิดพลาด', error);
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
        <Text className="font-kanit text-gray-500" style={{ fontSize: 15, marginBottom: 24 }}>
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
        <View className="mb-8">
          <PasswordStrengthIndicator password={newPassword} />
        </View>

        {/* Save Button */}
        <PrimaryButton title="บันทึกข้อมูล" onPress={handleSave} loading={saving} />
      </View>
    </ScreenWrapper>
  );
}
