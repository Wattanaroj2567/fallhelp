import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { listEvents } from '@/services/eventService';
import { getUserElders } from '@/services/userService';
import { Event } from '@/services/types';

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format date for display
// ==========================================
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear() + 543;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return `${day}/${month}/${year} เวลา ${time} น.`;
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: History List Screen
// ==========================================
export default function HistoryScreen() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch and filter event history
  // ==========================================
  const { data: events, isLoading, refetch, isError } = useQuery({
    queryKey: ['historyEvents'],
    queryFn: async () => {
      const elders = await getUserElders();
      if (!elders || elders.length === 0) {
        return [];
      }

      const elderId = elders[0].id;

      // Fetch a large batch to filter client-side
      const response = await listEvents({
        elderId: elderId,
        page: 1,
        pageSize: 100
      });

      // Filter for specific event types
      const allowedTypes = ['FALL', 'HEART_RATE_HIGH', 'HEART_RATE_LOW'];
      const eventData = Array.isArray(response.data) ? response.data : [];
      const filteredEvents = eventData.filter(e => allowedTypes.includes(e.type));

      return filteredEvents;
    },
  });

  const totalEvents = events?.length || 0;

  // ==========================================
  // 🧩 LAYER: Logic (Presentation Logic)
  // Purpose: Determine display text/colors based on event type
  // ==========================================
  const getEventDisplayInfo = (item: Event) => {
    let titleStatus = 'ปกติ';
    let description = 'เหตุการณ์ทั่วไป';
    let bpmText = item.value ? `${Math.round(item.value)} BPM` : '';

    switch (item.type) {
      case 'FALL':
        titleStatus = 'ล้ม';
        description = 'ตรวจพบการหกล้ม';
        break;
      case 'HEART_RATE_HIGH':
        titleStatus = 'ชีพจรสูง';
        description = 'ชีพจรสูงกว่าปกติ';
        break;
      case 'HEART_RATE_LOW':
        titleStatus = 'ชีพจรต่ำ';
        description = 'ชีพจรต่ำกว่าปกติ';
        break;
      default:
        description = item.type;
    }

    return { titleStatus, description, bpmText };
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual list item
  // ==========================================
  const renderItem = ({ item, index }: { item: Event, index: number }) => {
    const { titleStatus, description, bpmText } = getEventDisplayInfo(item);
    const displayIndex = totalEvents - index;

    return (
      <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F5F6F7] p-4 border border-gray-100">
        {/* Index Column */}
        <View className="mr-3 w-14 items-center justify-center border-r border-gray-200">
          <Text
            className="font-kanit text-xl font-medium text-gray-400"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayIndex}
          </Text>
        </View>

        {/* Info Column */}
        <View className="flex-1 pl-2">
          <Text className="font-kanit text-xs text-gray-500 mb-1">
            {formatDate(item.timestamp)}
          </Text>
          <Text className="font-kanit text-base font-bold text-gray-800">
            {description}
          </Text>
        </View>

        {/* Status Column */}
        <View className="items-end ml-2 min-w-[70px]">
          <Text className="font-kanit text-sm font-bold mb-1" style={{
            color: titleStatus === 'ล้ม' || titleStatus.includes('สูง') || titleStatus.includes('ต่ำ')
              ? '#EF4A5A'
              : '#4B5563'
          }}>
            {titleStatus}
          </Text>
          {bpmText ? (
            <Text className="font-kanit text-sm font-medium text-gray-600">
              {bpmText}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-2">
        {/* Header */}
        <View className="mb-6 items-center py-4">
          <Text className="font-kanit text-2xl font-bold text-black">
            ประวัติการหกล้ม
          </Text>
        </View>

        {/* Navigation Link */}
        <TouchableOpacity
          className="flex-row items-center justify-between py-4 mb-2 border-b border-gray-100"
          onPress={() => router.push('/(history-features)/report-summary')}
        >
          <Text className="font-kanit text-lg font-medium text-gray-900">
            ดูรายงานสรุปประจำเดือน
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        <Text className="font-kanit text-sm text-gray-500 mb-4 mt-2">
          แสดงรายการเหตุการณ์ทั้งหมด
        </Text>

        {/* List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16AD78" />
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="mt-10 items-center">
                <Text className="font-kanit text-gray-400">
                  ไม่มีประวัติเหตุการณ์ผิดปกติ
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}