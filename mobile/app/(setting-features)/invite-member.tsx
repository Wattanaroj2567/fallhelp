import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';
import { inviteMember } from '@/services/elderService';
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

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Invite Member Screen
// ==========================================
export default function InviteMember() {
  const router = useRouter();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage email input
  // ==========================================
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Focus State
  const [emailFocused, setEmailFocused] = useState(false);

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

  const emailAnim = useInputAnimation(emailFocused, email);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder ID
  // ==========================================
  const { data: currentElder } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Send invitation
  // ==========================================
  const inviteMutation = useMutation({
    mutationFn: async (data: { elderId: string; email: string }) => {
      await inviteMember(data.elderId, { email: data.email });
    },
    onSuccess: () => {
      Alert.alert(
        'สำเร็จ',
        'เชิญสมาชิกผู้ดูแลคนอื่นเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Error inviting member:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเชิญสมาชิกได้');
    },
  });

  // ==========================================
  // 🧩 LAYER: Logic (Validation)
  // Purpose: Validate email format
  // ==========================================
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle invite submission
  // ==========================================
  const handleInvite = () => {
    if (!email.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลผู้ใช้ที่ต้องการเชิญ');
      return;
    }

    if (emailError) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('รูปแบบอีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    if (!currentElder?.id) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้สูงอายุ');
      return;
    }

    inviteMutation.mutate({
      elderId: currentElder.id,
      email: email.trim(),
    });
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the invite form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          เชิญสมาชิกผู้ดูแล
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
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="person-add" size={40} color="#16AD78" />
              </View>
            </View>

            {/* Info Text */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
              <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700 mb-2">
                กรุณากรอกอีเมลผู้ใช้ที่คุณต้องการเชิญ
              </Text>
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-600">
                สมาชิกจะได้รับสิทธิ์ดูข้อมูลอย่างเดียว (ไม่สามารถแก้ไขหรือลบ)
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, emailAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[emailAnim.textStyle]}>อีเมล</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${emailFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
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
                  autoCorrect={false}
                  spellCheck={false}
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
                />
              </View>
              {emailError ? (
                <Text className="font-kanit text-red-500 text-xs mt-1">{emailError}</Text>
              ) : null}
            </View>

            {/* Features List */}
            <View className="bg-white rounded-2xl p-4 mb-6">
              <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-900 mb-3">
                สิทธิ์ของสมาชิกที่ถูกเชิญ:
              </Text>
              <View className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#16AD78" />
                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 ml-2 flex-1">
                  ดูข้อมูลผู้สูงอายุ
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#16AD78" />
                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 ml-2 flex-1">
                  ดูแดชบอร์ดและสถานะ Real-time
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#16AD78" />
                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 ml-2 flex-1">
                  ดูประวัติการหกล้ม
                </Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 ml-2 flex-1">
                  ไม่สามารถแก้ไขหรือลบข้อมูลได้
                </Text>
              </View>
            </View>

            {/* Invite Button */}
            <TouchableOpacity
              onPress={handleInvite}
              disabled={inviteMutation.isPending}
              className="bg-[#16AD78] rounded-2xl py-4 items-center"
              style={{ opacity: inviteMutation.isPending ? 0.6 : 1 }}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  ยืนยัน
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
