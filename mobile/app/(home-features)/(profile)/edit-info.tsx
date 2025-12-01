import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit User Profile Screen
// ==========================================
export default function EditUserInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Focus State
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

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

  const firstNameAnim = useInputAnimation(firstNameFocused, firstName);
  const lastNameAnim = useInputAnimation(lastNameFocused, lastName);
  const phoneAnim = useInputAnimation(phoneFocused, phone);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current profile
  // ==========================================
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  });

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update profile
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone?: string }) => {
      await updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      Alert.alert(
        'สำเร็จ',
        'บันทึกข้อมูลเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อและนามสกุล');
      return;
    }

    updateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="font-kanit text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          อัปเดตข้อมูลของคุณ
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
            {/* First Name & Last Name */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2" style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, firstNameAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[firstNameAnim.textStyle]}>ชื่อ</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${firstNameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                />
              </View>
              <View className="flex-1 ml-2" style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, lastNameAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[lastNameAnim.textStyle]}>นามสกุล</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${lastNameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, phoneAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[phoneAnim.textStyle]}>เบอร์โทรศัพท์</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${phoneFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={phone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 10) {
                      setPhone(cleaned);
                    }
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#16AD78] rounded-2xl py-4 items-center"
              style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  บันทึกข้อมูล
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
