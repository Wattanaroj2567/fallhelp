import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact, listContacts } from '@/services/emergencyContactService';
import Logger from '@/utils/logger';
import { showErrorMessage } from '@/utils/errorHelper';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getUserElders } from '@/services/userService';
import { PrimaryButton } from '@/components/PrimaryButton';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Emergency Contact Screen
// ==========================================
export default function EditEmergencyContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder & contact details
  // ==========================================

  // 1. Fetch Elder ID
  const { data: currentElder } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // 2. Fetch Contact Details
  const { data: contact, isLoading } = useQuery({
    queryKey: ['emergencyContact', id],
    queryFn: async () => {
      if (!currentElder?.id || !id) return null;
      const contacts = await listContacts(currentElder.id);
      return contacts.find((c) => c.id === id) || null;
    },
    enabled: !!currentElder?.id && !!id,
  });

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone);
      setRelationship(contact.relationship || '');
    }
  }, [contact]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update contact
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; relationship?: string }) => {
      if (!contact?.id) throw new Error('ไม่พบข้อมูลผู้ติดต่อ');
      await updateContact(contact.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      Alert.alert('สำเร็จ', 'แก้ไขเบอร์ติดต่อฉุกเฉินเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: unknown) => {
      Logger.error('Error updating contact:', error);
      showErrorMessage('ข้อผิดพลาด', error);
    },
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Delete contact
  // ==========================================

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle save and delete actions
  // ==========================================
  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    if (!contact) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ติดต่อ');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || undefined,
    });
  };

  if (isLoading) {
    return <LoadingScreen useScreenWrapper={true} message="กำลังโหลดข้อมูล..." />;
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
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
          แก้ไขเบอร์ติดต่อฉุกเฉิน
        </Text>
        <Text className="font-kanit text-gray-500" style={{ fontSize: 15, marginBottom: 24 }}>
          กรุณากรอกข้อมูลให้ถูกต้องเพื่อให้ระบบติดต่อญาติได้ทันทีเมื่อเกิดเหตุฉุกเฉิน
        </Text>

        {/* Priority Badge - Centered outside card */}
        {contact && (
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-[#4A90E2] items-center justify-center shadow-sm border-2 border-white ring-2 ring-blue-100">
              <Text style={{ fontSize: 24, fontWeight: '700' }} className="font-kanit text-white">
                {contact.priority}
              </Text>
            </View>
            <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500 mt-2">
              ลำดับความสำคัญ
            </Text>
          </View>
        )}

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

        {/* Save Button */}
        <View className="mt-2">
          <PrimaryButton
            title="บันทึกการแก้ไข"
            onPress={handleSave}
            loading={updateMutation.isPending}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
