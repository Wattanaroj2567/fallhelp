import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Phone Number Screen
// ==========================================
export default function EditPhone() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [phone, setPhone] = useState('');

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
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update phone
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: { phone?: string }) => {
      await updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      Alert.alert(
        'สำเร็จ',
        'บันทึกเบอร์โทรศัพท์เรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Logger.error('Error updating phone:', error);
      showErrorMessage('ข้อผิดพลาด', error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSave = () => {
    // Validate phone number (Thai: 10 digits starting with 0)
    if (phone && !/^0\d{9}$/.test(phone)) {
      Alert.alert('เบอร์โทรไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก');
      return;
    }

    updateMutation.mutate({
      phone: phone.trim() || undefined,
    });
  };

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
          แก้ไขเบอร์โทรศัพท์
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          กรุณากรอกเบอร์โทรศัพท์ของคุณ (10 หลัก)
        </Text>

        {/* Phone Input */}
        <View>
          <FloatingLabelInput
            label="เบอร์โทรศัพท์"
            value={phone}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              if (cleaned.length <= 10) {
                setPhone(cleaned);
              }
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 flex-row mb-8">
          <MaterialIcons
            name="info"
            size={20}
            color="#3B82F6"
            style={{ marginTop: 2 }}
          />
          <Text
            style={{ fontSize: 13, lineHeight: 20 }}
            className="font-kanit text-blue-700 flex-1 ml-2"
          >
            คุณจะต้องใช้เบอร์โทรศัพท์ใหม่ในการเข้าสู่ระบบครั้งถัดไป
          </Text>
        </View>

        {/* Save Button */}
        <View>
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
