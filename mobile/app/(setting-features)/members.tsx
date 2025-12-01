import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';
import { listMembers, removeMember } from '@/services/elderService';

interface MemberDisplay {
  id: string;
  email: string;
  role: 'OWNER' | 'VIEWER';
  name: string;
}

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Members Management Screen
// ==========================================
export default function Members() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder ID & Members List
  // ==========================================

  // 1. Fetch Elder ID first (usually this would be from a global context or params)
  const { data: currentElder } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // 2. Fetch Members using Elder ID
  const { data: members, isLoading, isError, refetch } = useQuery({
    queryKey: ['members', currentElder?.id],
    queryFn: async () => {
      if (!currentElder?.id) return [];
      const memberList = await listMembers(currentElder.id);

      if (!Array.isArray(memberList)) {
        console.warn('memberList is not an array:', memberList);
        return [];
      }

      return memberList.map((m: any) => ({
        id: m.userId || m.id,
        email: m.user?.email || m.email || 'ไม่ระบุ',
        role: (m.accessLevel === 'OWNER' ? 'OWNER' : 'VIEWER') as 'OWNER' | 'VIEWER',
        name: m.user ? `${m.user.firstName} ${m.user.lastName}` : 'ไม่ระบุ',
      })) as MemberDisplay[];
    },
    enabled: !!currentElder?.id,
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Delete Member
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!currentElder?.id) throw new Error('No elder ID');
      await removeMember(currentElder.id, memberId);
    },
    onSuccess: () => {
      Alert.alert('สำเร็จ', 'ลบสมาชิกเรียบร้อยแล้ว');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: () => {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบสมาชิกได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle delete confirmation
  // ==========================================
  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'ยืนยันการลบสมาชิก',
      `คุณต้องการลบ ${memberName} ออกจากกลุ่มใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(memberId),
        },
      ]
    );
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual member item
  // ==========================================
  const renderMemberItem = ({ item }: { item: MemberDisplay }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100">
      <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
        <Ionicons name="person" size={24} color="#16AD78" />
      </View>
      <View className="flex-1">
        <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-900">
          {item.name}
        </Text>
        <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500">
          {item.email}
        </Text>
        <View className="mt-1">
          <View
            className={`self-start px-2 py-0.5 rounded-full ${item.role === 'OWNER' ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
          >
            <Text
              style={{ fontSize: 12 }}
              className={`font-kanit ${item.role === 'OWNER' ? 'text-yellow-700' : 'text-gray-600'}`}
            >
              {item.role === 'OWNER' ? 'เจ้าของกลุ่ม' : 'ดูอย่างเดียว'}
            </Text>
          </View>
        </View>
      </View>
      {item.role !== 'OWNER' && (
        <TouchableOpacity
          onPress={() => handleDeleteMember(item.id, item.name)}
          className="ml-2 p-2"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render empty state
  // ==========================================
  const renderEmptyState = () => (
    <View className="items-center justify-center py-12">
      <Ionicons name="people-outline" size={80} color="#D1D5DB" />
      <Text style={{ fontSize: 18, fontWeight: '600' }} className="font-kanit text-gray-900 mt-4">
        ยังไม่มีสมาชิกในกลุ่ม
      </Text>
      <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500 mt-2 text-center px-6">
        เชิญสมาชิกคนอื่นเข้ามาดูแลผู้สูงอายุร่วมกัน
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(setting-features)/invite-member')}
        className="mt-6 bg-[#16AD78] rounded-2xl px-6 py-3"
      >
        <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
          เชิญสมาชิก
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
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          จัดการสมาชิก
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16AD78" />
        </View>
      ) : (
        <>
          {/* Info Box */}
          <View className="p-6">
            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
                สมาชิกที่ถูกเชิญจะสามารถดูข้อมูลผู้สูงอายุและประวัติการหกล้มได้เท่านั้น
                ไม่สามารถแก้ไขหรือลบข้อมูลได้
              </Text>
            </View>

            {/* Member List */}
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
            />
          </View>

          {/* Fixed Bottom Button */}
          {members && members.length > 0 && (
            <View className="p-6 bg-white border-t border-gray-200">
              <TouchableOpacity
                onPress={() => router.push('/(setting-features)/invite-member')}
                className="bg-[#16AD78] rounded-2xl py-4 items-center"
              >
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  เชิญสมาชิกเข้ากลุ่มของคุณ
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
