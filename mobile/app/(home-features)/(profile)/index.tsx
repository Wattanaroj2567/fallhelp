import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/userService';

// ==========================================
// 🧩 LAYER: Logic (Helper)
// Purpose: Format gender text
// ==========================================
const getGenderText = (gender: string | null | undefined): string => {
  if (!gender) return 'ไม่ระบุ';
  switch (gender.toUpperCase()) {
    case 'MALE': return 'ชาย';
    case 'FEMALE': return 'หญิง';
    case 'OTHER': return 'อื่นๆ';
    default: return gender;
  }
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: User Profile Screen
// ==========================================
export default function Profile() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch user profile
  // ==========================================
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
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

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="person-circle-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 18 }} className="font-kanit text-gray-700 mt-4 text-center">
            ไม่พบข้อมูลโปรไฟล์
          </Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-gray-200 p-3 rounded-lg">
            <Text className="font-kanit">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render profile details
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          ข้อมูลส่วนตัว
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#16AD78']} />
        }
      >
        <View className="p-6">
          {/* Profile Picture */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
              {profile.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={64} color="#9CA3AF" />
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(home-features)/(profile)/edit-info')}
              className="mt-4"
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-[#4A90E2]">
                เปลี่ยนรูปโปรไฟล์
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Fields */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            {/* First Name */}
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  ชื่อ
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {profile.firstName || 'ไม่ระบุ'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(home-features)/(profile)/edit-info')}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-500">
                  แก้ไข
                </Text>
              </TouchableOpacity>
            </View>

            {/* Last Name */}
            <View className="mb-6 flex-row items-center justify-between border-t border-gray-100 pt-6">
              <View className="flex-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  นามสกุล
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {profile.lastName || 'ไม่ระบุ'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(home-features)/(profile)/edit-info')}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-500">
                  แก้ไข
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone */}
            <View className="mb-6 flex-row items-center justify-between border-t border-gray-100 pt-6">
              <View className="flex-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  เบอร์โทรศัพท์
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {profile.phone || 'ไม่ระบุ'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(home-features)/(profile)/edit-info')}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-500">
                  แก้ไข
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View className="mb-6 flex-row items-center justify-between border-t border-gray-100 pt-6">
              <View className="flex-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  อีเมล
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  {profile.email}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(home-features)/(profile)/change-email')}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-500">
                  แก้ไข
                </Text>
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View className="flex-row items-center justify-between border-t border-gray-100 pt-6">
              <View className="flex-1">
                <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                  รหัสผ่าน
                </Text>
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                  ••••••••
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(home-features)/(profile)/change-password')}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-500">
                  เปลี่ยน
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Badge */}
          <View className="bg-blue-50 rounded-2xl p-4 flex-row items-center">
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700 ml-2">
              บทบาท: {profile.role === 'CAREGIVER' ? 'ญาติผู้ดูแล' : profile.role}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

