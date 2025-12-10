import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getProfile, updateProfile } from '@/services/userService';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function ChangeEmail() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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

      Alert.alert(
        'สำเร็จ',
        'เปลี่ยนอีเมลเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Logger.error('Error updating email:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเปลี่ยนอีเมลได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="font-kanit text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      header={<ScreenHeader title="แก้ไขอีเมล" onBack={() => router.back()} />}
    >
      <View>
        <Text
          className="font-kanit"
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          กรุณากรอกอีเมลใหม่ของคุณ
        </Text>

        {/* Current Email (Read-only) */}
        <View className="mb-4">
          <Text
            style={{ fontSize: 12 }}
            className="font-kanit text-gray-500 mb-2 ml-1"
          >
            อีเมลปัจจุบัน
          </Text>
          <View
            className="bg-gray-100 rounded-2xl px-4 border border-gray-200 justify-center"
            style={{ height: 60 }}
          >
            <Text style={{ fontSize: 16 }} className="font-kanit text-gray-500">
              {currentEmail}
            </Text>
          </View>
        </View>

        {/* New Email */}
        <View className="mb-8">
          <FloatingLabelInput
            label="อีเมลใหม่"
            value={newEmail}
            onChangeText={(text) => {
              setNewEmail(text);
              if (/[ก-๙]/.test(text)) {
                setEmailError("กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
              } else {
                setEmailError("");
              }
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-8 flex-row">
          <MaterialIcons
            name="info"
            size={20}
            color="#3B82F6"
            style={{ marginTop: 2 }}
          />
          <Text
            style={{ fontSize: 12 }}
            className="font-kanit text-blue-700 flex-1 ml-2"
          >
            คุณจะต้องใช้อีเมลใหม่ในการเข้าสู่ระบบครั้งถัดไป
          </Text>
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
