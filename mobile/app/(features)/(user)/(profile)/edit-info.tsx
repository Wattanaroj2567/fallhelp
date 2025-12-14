import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/services/userService';
import Logger from '@/utils/logger';
import { showErrorMessage } from "@/utils/errorHelper";
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';

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
    onError: (error: unknown) => {
      Logger.error("Error updating profile:", error);
      showErrorMessage("ข้อผิดพลาด", error);
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

// ... (imports)

// ...

  if (isLoading) {
    return <LoadingScreen useScreenWrapper message="กำลังโหลดข้อมูล..." />;
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: false,
        overScrollMode: "never",
      }}
      header={<ScreenHeader title="" onBack={() => router.back()} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          แก้ไขชื่อ-นามสกุล
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          กรุณากรอกชื่อและนามสกุลของคุณ
        </Text>

        {/* First Name & Last Name */}
        <View className="flex-row gap-4">
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
