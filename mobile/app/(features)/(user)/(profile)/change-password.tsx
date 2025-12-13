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
      useScrollView={true}
      header={
        <View style={{ backgroundColor: "#FFFFFF" }}>
          <ScreenHeader title="เปลี่ยนรหัสผ่าน" onBack={() => router.back()} />
          <View className="items-center pb-6 px-6 border-b border-gray-50">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3 border border-blue-100">
              <MaterialIcons name="lock" size={32} color="#3B82F6" />
            </View>
            <Text
              style={{ fontSize: 13, lineHeight: 20 }}
              className="font-kanit text-gray-500 text-center px-4"
            >
              กรุณากรอกรหัสผ่านปัจจุบันและใหม่
            </Text>
          </View>
        </View>
      }
    >
      <View className="pt-6 px-4">

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

        {/* Password Requirements */}
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
              ใช้ตัวอักษร 8 ตัวขึ้นไป
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
              มีตัวเลขอย่างน้อย 1 ตัวและอักขระพิเศษ
            </Text>
          </View>
        </View>

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
