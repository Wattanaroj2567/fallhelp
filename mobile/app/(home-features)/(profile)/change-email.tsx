import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, updateProfile } from '@/services/userService';
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

export default function ChangeEmail() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Focus State
  const [newEmailFocused, setNewEmailFocused] = useState(false);

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

  const newEmailAnim = useInputAnimation(newEmailFocused, newEmail);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setCurrentEmail(profile.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      console.error('Error updating email:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเปลี่ยนอีเมลได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="text-gray-900">
          อัปเดตอีเมล
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
            {/* Current Email (Read-only) */}
            <View className="mb-6">
              <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 mb-2">
                อีเมลปัจจุบัน
              </Text>
              <View className="bg-gray-100 rounded-2xl px-4 border border-gray-200 justify-center" style={{ height: 60 }}>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-600">
                  {currentEmail}
                </Text>
              </View>
            </View>

            {/* New Email */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, newEmailAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[newEmailAnim.textStyle]}>อีเมลใหม่</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${newEmailFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    if (/[ก-๙]/.test(text)) {
                      setEmailError('กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
                    } else {
                      setEmailError('');
                    }
                  }}
                  onFocus={() => setNewEmailFocused(true)}
                  onBlur={() => setNewEmailFocused(false)}
                />
              </View>
              {emailError ? (
                <Text className="font-kanit text-red-500 text-xs mt-1">{emailError}</Text>
              ) : null}
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row">
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1 ml-2">
                คุณจะต้องใช้อีเมลใหม่ในการเข้าสู่ระบบครั้งถัดไป
              </Text>
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
