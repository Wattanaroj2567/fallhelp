import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact, deleteContact, listContacts } from '@/services/emergencyContactService';
import { getUserElders } from '@/services/userService';
import { EmergencyContact } from '@/services/types';
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

  // Focus State
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [relFocused, setRelFocused] = useState(false);

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

  const nameAnim = useInputAnimation(nameFocused, name);
  const phoneAnim = useInputAnimation(phoneFocused, phone);
  const relAnim = useInputAnimation(relFocused, relationship);

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
      return contacts.find(c => c.id === id) || null;
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
      queryClient.invalidateQueries({ queryKey: ['emergencyContact', id] });
      Alert.alert(
        'สำเร็จ',
        'อัปเดตข้อมูลเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Error updating contact:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
    },
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Delete contact
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!contact?.id) throw new Error('ไม่พบข้อมูลผู้ติดต่อ');
      await deleteContact(contact.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      Alert.alert(
        'สำเร็จ',
        'ลบผู้ติดต่อฉุกเฉินเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถลบผู้ติดต่อได้');
    },
  });

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

  const handleDelete = () => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบ "${name}" ออกจากรายชื่อผู้ติดต่อฉุกเฉินหรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
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
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
            ข้อมูลเบอร์ติดต่อฉุกเฉิน
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} className="p-2" disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
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
            {/* Priority Badge */}
            {contact && (
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-full bg-[#4A90E2] items-center justify-center">
                  <Text style={{ fontSize: 24, fontWeight: '700' }} className="font-kanit text-white">
                    {contact.priority}
                  </Text>
                </View>
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mt-2">
                  ลำดับความสำคัญ
                </Text>
              </View>
            )}

            {/* Name Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, nameAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[nameAnim.textStyle]}>ชื่อผู้ติดต่อ</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${nameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Phone Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, phoneAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[phoneAnim.textStyle]}>เบอร์ติดต่อ</Animated.Text>
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

            {/* Relationship Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, relAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[relAnim.textStyle]}>ความสัมพันธ์</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${relFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={relationship}
                  onChangeText={setRelationship}
                  onFocus={() => setRelFocused(true)}
                  onBlur={() => setRelFocused(false)}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#16AD78] rounded-2xl py-4 items-center mb-4"
              style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  บันทึกการแก้ไข
                </Text>
              )}
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              className="border border-red-500 rounded-2xl py-4 items-center"
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-red-500">
                  ลบผู้ติดต่อฉุกเฉิน
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
