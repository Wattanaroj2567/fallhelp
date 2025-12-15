import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createContact } from '@/services/emergencyContactService';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorMessage } from '@/utils/errorHelper';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useCurrentElder } from '@/hooks/useCurrentElder'; // [NEW] Use Hook
import { LoadingScreen } from '@/components/LoadingScreen'; // [NEW] Standard Loading
import { MaterialIcons } from '@expo/vector-icons';

export default function AddEmergencyContact() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // [NEW] Use Hook instead of manual fetch
  const { data: currentElder, isLoading: isElderLoading } = useCurrentElder();
  const elderId = currentElder?.id;
  const isReadOnly =
    !currentElder ||
    (currentElder.accessLevel !== 'OWNER' && currentElder.accessLevel !== 'EDITOR');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSave = async () => {
    if (isReadOnly) {
      Alert.alert('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์ในการเพิ่มข้อมูล');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    if (!elderId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้สูงอายุ');
      return;
    }

    setLoading(true);
    try {
      await createContact(elderId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });

      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });

      Alert.alert('สำเร็จ', 'เพิ่มเบอร์ติดต่อฉุกเฉินเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: unknown) {
      Logger.error('Error adding contact:', error);
      showErrorMessage('ข้อผิดพลาด', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================

  // [NEW] Loading State
  if (isElderLoading) {
    return <LoadingScreen useScreenWrapper />;
  }

  // [NEW] View Only State Block (Optional - or just hide button)
  if (isReadOnly) {
    // We can redirect back or show a blocked screen.
    // For better UX, let's show an empty state or redirect back immediately?
    // Usually "Add" button is hidden in index.tsx if read-only.
    // But if they deep link here:
    return (
      <ScreenWrapper useScrollView={false}>
        <ScreenHeader title="เพิ่มเบอร์โทร" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="lock" size={60} color="#CA8A04" />
          <Text className="font-kanit text-lg text-gray-800 mt-4 text-center">
            ไม่มีสิทธิ์เข้าถึง
          </Text>
          <Text className="font-kanit text-gray-500 mt-2 text-center">
            เฉพาะผู้ดูแลหลักและผู้ช่วยแก้ไขได้เท่านั้น
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: false,
        overScrollMode: 'never',
      }}
      header={<ScreenHeader title="" onBack={() => router.back()} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          เพิ่มเบอร์ติดต่อฉุกเฉิน
        </Text>
        <Text className="font-kanit text-gray-500" style={{ fontSize: 15, marginBottom: 24 }}>
          กรุณากรอกข้อมูลให้ถูกต้องเพื่อให้ระบบติดต่อญาติได้ทันทีเมื่อเกิดเหตุฉุกเฉิน
        </Text>

        {/* Form Fields */}
        <View className="mb-6">
          {/* Name Field */}
          <View className="mb-5">
            <FloatingLabelInput
              label="ชื่อผู้ติดต่อ"
              value={name}
              onChangeText={setName}
              isRequired={true}
            />
          </View>

          {/* Phone Field */}
          <View className="mb-5">
            <FloatingLabelInput
              label="เบอร์ติดต่อ"
              value={phone}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length <= 10) {
                  setPhone(cleaned);
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              isRequired={true}
            />
          </View>

          {/* Relationship Field */}
          <View>
            <FloatingLabelInput
              label="ความสัมพันธ์ (ถ้ามี)"
              value={relationship}
              onChangeText={setRelationship}
              placeholder="เช่น บุตร, พี่, น้อง"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="mt-2">
          <PrimaryButton title="บันทึกข้อมูล" onPress={handleSave} loading={loading} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
