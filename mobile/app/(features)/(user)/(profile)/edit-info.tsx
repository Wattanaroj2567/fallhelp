import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/services/userService';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

import { GenderSelect } from '@/components/GenderSelect';
import { Gender } from '@/services/types';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Name Screen (ชื่อ-นามสกุล only)
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
  const [gender, setGender] = useState<Gender | null>(null);

  // Animation Hooks


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
      setGender(profile.gender || null);
    }
  }, [profile]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update profile
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; gender?: Gender | null }) => {
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
      Logger.error('Error updating profile:', error);
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
      gender: gender,
    });
  };

  if (isLoading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="font-kanit text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      header={
        <ScreenHeader title="แก้ไขชื่อ-นามสกุล" onBack={() => router.back()} />
      }
    >
      <View className="flex-1 pt-6">
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text
            className="font-kanit"
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            กรุณากรอกชื่อและนามสกุลของคุณ
          </Text>

          {/* First Name & Last Name */}
          <View className="flex-row gap-4 mb-5">
            <View className="flex-1">
              <FloatingLabelInput
                label="ชื่อ"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <FloatingLabelInput
                label="นามสกุล"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Gender Selection */}
          <View>
            <GenderSelect
              value={(gender as string) || ""}
              onChange={(val) => setGender((val as Gender) || null)}
              isRequired={false}
            />
          </View>
        </View>

        {/* Save Button */}
        <View className="mt-2">
          <PrimaryButton
            title="บันทึกข้อมูล"
            onPress={handleSave}
            loading={updateMutation.isPending}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
