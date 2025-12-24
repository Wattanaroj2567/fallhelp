import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/services/userService';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ChangeEmail() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setCurrentEmail(profile.email);
    } catch (error) {
      Logger.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!newEmail.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลใหม่');
      return;
    }

    if (emailError) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
      return;
    }

    if (!validateEmail(newEmail)) {
      Alert.alert('รูปแบบอีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    if (newEmail === currentEmail) {
      Alert.alert('แจ้งเตือน', 'อีเมลใหม่เหมือนกับอีเมลเดิม');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ email: newEmail.trim() });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userElders'] });

      Alert.alert('สำเร็จ', 'เปลี่ยนอีเมลเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: unknown) {
      Logger.error('Error updating email:', error);
      const message = error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนอีเมลได้';
      Alert.alert('ข้อผิดพลาด', message);
    } finally {
      setSaving(false);
    }
  };

  // ...

  if (loading) {
    return <LoadingScreen useScreenWrapper message="กำลังโหลดข้อมูล..." />;
  }

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
          แก้ไขอีเมล
        </Text>
        <Text className="font-kanit text-gray-500" style={{ fontSize: 15, marginBottom: 24 }}>
          กรุณากรอกอีเมลใหม่ของคุณ
        </Text>

        {/* Current Email (Read-only) */}
        <View className="mb-4">
          <Text className="font-kanit text-gray-500 mb-2 ml-1" style={{ fontSize: 14 }}>
            อีเมลปัจจุบัน
          </Text>
          <View
            className="rounded-xl border border-gray-200 justify-center px-4"
            style={{ height: 56, backgroundColor: '#F9FAFB' }}
          >
            <Text
              className="font-kanit"
              style={{ fontSize: 16, color: '#4B5563', lineHeight: 24 }}
              numberOfLines={1}
            >
              {currentEmail}
            </Text>
          </View>
        </View>

        {/* New Email */}
        <View>
          <FloatingLabelInput
            label="อีเมลใหม่"
            value={newEmail}
            onChangeText={(text) => {
              setNewEmail(text);
              if (/[ก-๙]/.test(text)) {
                setEmailError('กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
              } else {
                setEmailError('');
              }
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 flex-row mb-8">
          <MaterialIcons name="info" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
          <Text
            style={{ fontSize: 13, lineHeight: 20 }}
            className="font-kanit text-blue-700 flex-1 ml-2"
          >
            คุณจะต้องใช้อีเมลใหม่ในการเข้าสู่ระบบครั้งถัดไป
          </Text>
        </View>

        {/* Save Button */}
        <View>
          <PrimaryButton title="บันทึกข้อมูล" onPress={handleSave} loading={saving} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
