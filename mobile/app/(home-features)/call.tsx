import React from 'react';
import { Text, View, TouchableOpacity, Linking, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';
import { listContacts } from '@/services/emergencyContactService';
import { EmergencyContact } from '@/services/types';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Emergency Call Screen
// ==========================================
export default function CallScreen() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch emergency contacts
  // ==========================================
  const { data: contacts, isLoading, isError, refetch } = useQuery<EmergencyContact[]>({
    queryKey: ['emergencyContacts'],
    queryFn: async () => {
      const elders = await getUserElders();
      if (elders && elders.length > 0) {
        const contactList = await listContacts(elders[0].id);
        if (Array.isArray(contactList)) {
          return contactList.sort((a, b) => a.priority - b.priority);
        }
      }
      return [];
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle call action
  // ==========================================
  const makeCall = (phoneNumber: string, name: string) => {
    Alert.alert(
      'โทรฉุกเฉิน',
      `คุณต้องการโทรหา ${name} (${phoneNumber}) ใช่หรือไม่ ? `,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'โทร',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber} `).catch(() => {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดแอปโทรศัพท์ได้');
            });
          },
        },
      ]
    );
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual contact item
  // ==========================================
  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <TouchableOpacity
      onPress={() => makeCall(item.phone, item.name)}
      className="bg-white rounded-2xl p-5 mb-4 flex-row items-center shadow-sm border-2 border-red-200"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mr-4">
        <Text style={{ fontSize: 18, fontWeight: '700' }} className="font-kanit text-white">
          {item.priority}
        </Text>
      </View>

      <View className="flex-1">
        <Text style={{ fontSize: 18, fontWeight: '600' }} className="font-kanit text-gray-900">
          {item.name}
        </Text>
        <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600">
          {item.relationship} • {item.phone}
        </Text>
      </View>

      <Ionicons name="call" size={28} color="#EF4444" />
    </TouchableOpacity>
  );

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render empty state
  // ==========================================
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="call-outline" size={100} color="#D1D5DB" />
      <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900 mt-6 text-center">
        ยังไม่มีเบอร์ติดต่อฉุกเฉิน
      </Text>
      <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500 mt-2 text-center">
        กรุณาเพิ่มเบอร์ติดต่อฉุกเฉินก่อนใช้งาน
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(home-features)/(emergency)/add')}
        className="bg-[#16AD78] rounded-2xl py-4 px-8 mt-8"
      >
        <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
          เพิ่มเบอร์ติดต่อ
        </Text>
      </TouchableOpacity>
    </View>
  );

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

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-red-500 px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-white">
            โทรฉุกเฉิน
          </Text>
        </View>

        {/* Add Button in Header */}
        <TouchableOpacity
          onPress={() => router.push('/(home-features)/(emergency)/add')}
          className="bg-white/20 p-2 rounded-full"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Warning Banner */}
      <View className="bg-red-100 border-l-4 border-red-500 p-4 mx-6 mt-6">
        <View className="flex-row items-start">
          <Ionicons name="warning" size={24} color="#EF4444" />
          <View className="flex-1 ml-3">
            <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-red-800">
              โทรฉุกเฉิน
            </Text>
            <Text style={{ fontSize: 12 }} className="font-kanit text-red-700 mt-1">
              เลือกผู้ติดต่อด้านล่างเพื่อโทรออกทันที
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <View className="flex-1 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-900">
              รายชื่อผู้ติดต่อฉุกเฉิน
            </Text>
          </View>

          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

