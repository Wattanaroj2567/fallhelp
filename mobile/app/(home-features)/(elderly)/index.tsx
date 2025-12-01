import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Calculate age from DOB
// ==========================================
const calculateAge = (dateOfBirth: string | null | undefined): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format Thai date
// ==========================================
const formatThaiDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'ไม่ระบุ';
  const date = new Date(dateString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate().toString().padStart(2, '0');
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format gender text
// ==========================================
const getGenderText = (gender: string | null | undefined): string => {
  if (!gender) return 'ไม่ระบุ';
  switch (gender) {
    case 'MALE': return 'ชาย';
    case 'FEMALE': return 'หญิง';
    case 'OTHER': return 'อื่นๆ';
    default: return 'ไม่ระบุ';
  }
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Elder Info Screen
// ==========================================
export default function ElderInfo() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder Profile
  // ==========================================
  const { data: elder, isLoading, refetch, isError } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

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

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="font-kanit text-red-500 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-gray-200 p-3 rounded-lg">
          <Text className="font-kanit">ลองใหม่</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!elder) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 18 }} className="font-kanit text-gray-700 mt-4 text-center">
            ไม่พบข้อมูลผู้สูงอายุ
          </Text>
          <Text className="font-kanit text-gray-500 mt-2 text-center">
            กรุณาเพิ่มข้อมูลผู้สูงอายุในระบบ
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 🧩 LAYER: Logic (Presentation Logic)
  // Purpose: Calculate derived state
  // ==========================================
  const age = calculateAge(elder.dateOfBirth);

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          ข้อมูลผู้สูงอายุ
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#16AD78']} />
        }
      >
        <View className="p-6">
          {/* Main Info Card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            {/* Profile Icon */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="person" size={48} color="#9CA3AF" />
              </View>
            </View>

            {/* Name & Age */}
            <View className="mb-6">
              <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                ชื่อผู้สูงอายุ
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600' }} className="font-kanit text-gray-900">
                {elder.firstName} {elder.lastName}
              </Text>
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                เพศ
              </Text>
              <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                {getGenderText(elder.gender)}
              </Text>
            </View>

            {/* Date of Birth */}
            <View className="mb-6">
              <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                วัน/เดือน/ปีเกิด
              </Text>
              <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                {formatThaiDate(elder.dateOfBirth)}
                {age > 0 && (
                  <Text className="font-kanit text-gray-500"> ({age} ปี)</Text>
                )}
              </Text>
            </View>

            {/* Height & Weight */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-3">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  ส่วนสูง
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {elder.height ? `${elder.height} cm` : 'ไม่ระบุ'}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  น้ำหนัก
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {elder.weight ? `${elder.weight} kg` : 'ไม่ระบุ'}
                </Text>
              </View>
            </View>

            {/* Medical Conditions */}
            <View className="mb-6">
              <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                โรคประจำตัว หรือ เคยป่วย
              </Text>
              <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                {elder.diseases && elder.diseases.length > 0 ? elder.diseases.join(', ') : 'ไม่มี'}
              </Text>
            </View>

            {/* Notes/Address */}
            {elder.notes && (
              <View className="mb-6">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  หมายเหตุ
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {elder.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => router.push('/(home-features)/(elderly)/edit')}
            className="bg-gray-200 rounded-2xl py-4 items-center"
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-700">
              แก้ไขข้อมูล
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
