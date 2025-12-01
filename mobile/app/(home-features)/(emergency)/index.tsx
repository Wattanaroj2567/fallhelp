import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';
import { listContacts, deleteContact } from '@/services/emergencyContactService';
import { EmergencyContact } from '@/services/types';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Emergency Contacts Management Screen
// ==========================================
export default function EmergencyContacts() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch contacts
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
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Delete contact
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      // Service only requires contactId
      await deleteContact(contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      Alert.alert('สำเร็จ', 'ลบเบอร์ติดต่อเรียบร้อยแล้ว');
    },
    onError: () => {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบเบอร์ติดต่อได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle actions (Call, Delete)
  // ==========================================
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบ "${name}" ออกจากรายชื่อผู้ติดต่อฉุกเฉินหรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render empty state
  // ==========================================
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8" style={{ minHeight: 400 }}>
      <Ionicons name="call-outline" size={80} color="#D1D5DB" />
      <Text style={{ fontSize: 18 }} className="font-kanit text-gray-700 mt-6 text-center">
        ยังไม่มีเบอร์ติดต่อฉุกเฉิน
      </Text>
      <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500 mt-2 text-center">
        เพิ่มเบอร์ติดต่อฉุกเฉินเพื่อความปลอดภัย
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(home-features)/(emergency)/add')}
        className="bg-[#16AD78] rounded-2xl py-4 px-8 mt-8 flex-row items-center"
      >
        <Ionicons name="call" size={20} color="#FFFFFF" />
        <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white ml-2">
          เพิ่มเบอร์ติดต่อฉุกเฉิน
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual contact item
  // ==========================================
  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        {/* Priority Number */}
        <View className="w-10 h-10 rounded-full bg-[#4A90E2] items-center justify-center mr-4">
          <Text style={{ fontSize: 16, fontWeight: '700' }} className="font-kanit text-white">
            {item.priority}
          </Text>
        </View>

        {/* Contact Info */}
        <View className="flex-1">
          <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-900">
            {item.name}
            {item.relationship && (
              <Text className="font-kanit text-gray-500"> ({item.relationship})</Text>
            )}
          </Text>
          <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600 mt-1">
            {item.phone}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/(home-features)/(emergency)/edit',
              params: { id: item.id }
            })}
            className="p-2 bg-blue-50 rounded-xl"
          >
            <Ionicons name="create-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            className="p-2 bg-red-50 rounded-xl"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
          รายชื่อเบอร์ติดต่อฉุกเฉิน
        </Text>
      </View>

      {!contacts || contacts.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#16AD78']} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <View className="flex-1">
          {/* Warning Banner */}
          <View className="bg-red-50 mx-6 mt-6 mb-4 p-4 rounded-2xl border-l-4 border-red-500">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
              <View className="flex-1">
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-red-700">
                  โทรฉุกเฉิน
                </Text>
                <Text style={{ fontSize: 12 }} className="font-kanit text-red-600 mt-1">
                  เลือกผู้ติดต่อด้านล่างเพื่อโทรออกทันที
                </Text>
              </View>
            </View>
          </View>

          {/* Info Header */}
          <View className="bg-blue-50 mx-6 mb-4 p-4 rounded-2xl">
            <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
              รายชื่อผู้ติดต่อฉุกเฉิน
            </Text>
          </View>

          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#16AD78']} />
            }
          />

          {/* Add Button (Fixed) */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
            <TouchableOpacity
              onPress={() => router.push('/(home-features)/(emergency)/add')}
              className="bg-[#16AD78] rounded-2xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white ml-2">
                เพิ่มเบอร์ติดต่อฉุกเฉิน
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
