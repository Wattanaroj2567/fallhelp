import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '@/services/notificationService';
import { getUserElders } from '@/services/userService';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Notification } from '@/services/types';
import Logger from '@/utils/logger';

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Formatters and Helpers
// ==========================================
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

  if (isToday) {
    return `วันนี้, ${timeStr}`;
  }
  return (
    date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    }) + `, ${timeStr}`
  );
};

const getNotificationConfig = (type: string) => {
  switch (type) {
    case 'FALL_DETECTED':
      return {
        icon: 'warning',
        color: '#EF4444', // Red-500
        bg: 'bg-red-50',
        title: 'ตรวจพบการหกล้ม',
        desc: 'ระบบตรวจพบการหกล้ม',
      };
    case 'EMERGENCY_CONTACT_CALLED':
      return {
        icon: 'phone-in-talk',
        color: '#F59E0B', // Amber-500
        bg: 'bg-amber-50',
        title: 'โทรฉุกเฉิน',
        desc: 'ระบบกำลังโทรหาผู้ติดต่อฉุกเฉิน',
      };
    case 'HEART_RATE_ALERT':
      return {
        icon: 'favorite',
        color: '#EF4444',
        bg: 'bg-red-50',
        title: 'แจ้งเตือนชีพจร',
        desc: 'อัตราการเต้นของหัวใจผิดปกติ',
      };
    case 'DEVICE_OFFLINE':
      return {
        icon: 'wifi-off',
        color: '#6B7280',
        bg: 'bg-gray-100',
        title: 'อุปกรณ์ขาดการเชื่อมต่อ',
        desc: 'ไม่สามารถติดต่ออุปกรณ์ได้',
      };
    case 'DEVICE_ONLINE':
      return {
        icon: 'wifi',
        color: '#10B981',
        bg: 'bg-green-50',
        title: 'อุปกรณ์เชื่อมต่อแล้ว',
        desc: 'อุปกรณ์กลับมาออนไลน์',
      };
    default:
      return {
        icon: 'notifications',
        color: '#6B7280', // Gray-500
        bg: 'bg-gray-50',
        title: 'แจ้งเตือน',
        desc: 'มีการแจ้งเตือนใหม่',
      };
  }
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Notification History Screen
// ==========================================
export default function Notifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Events
  // ==========================================

  // 1. Get Elder ID first
  const { data: _elder } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // 2. Fetch Notifications
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await listNotifications({
        pageSize: 50,
        page: 1,
      });
      return response.data || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] }), // Update badge on home
      refetch(),
    ]);
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    } catch (error) {
      Logger.error('Failed to mark all as read', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    } catch (error) {
      Logger.error('Failed to clear notifications', error);
    }
  };

  const handleItemPress = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
        // Optimistic update or refetch
        refetch();
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      } catch (error) {
        Logger.error('Failed to mark as read', error);
      }
    }
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render List Item
  // ==========================================
  const renderItem = ({ item }: { item: Notification }) => {
    const config = getNotificationConfig(item.type);

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        className={`flex-row items-start p-4 mb-3 rounded-[24px] border ${
          item.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
        }`}
      >
        {/* Icon */}
        <View className={`w-10 h-10 rounded-full ${config.bg} items-center justify-center mr-4`}>
          <MaterialIcons
            name={config.icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={config.color}
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text
              className={`font-kanit text-gray-800 text-[16px] flex-1 mr-2 ${
                item.isRead ? 'font-medium' : 'font-bold'
              }`}
            >
              {item.title || config.title}
            </Text>
            <Text className="font-kanit text-xs text-gray-400 mt-0.5">
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          <Text
            className={`font-kanit text-sm mt-1 ${item.isRead ? 'text-gray-500' : 'text-gray-700'}`}
          >
            {item.message || config.desc}
          </Text>

          {!item.isRead && (
            <View className="self-start bg-red-100 px-2 py-0.5 rounded-md mt-2">
              <Text className="text-[10px] font-kanit text-red-600 font-bold">ใหม่</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render UI
  // ==========================================
  return (
    <ScreenWrapper
      edges={['top']} // Match Settings
      useScrollView={false}
      header={
        <ScreenHeader
          title="ประวัติการแจ้งเตือน"
          onBack={() => router.back()}
          rightElement={
            notifications && notifications.length > 0 ? (
              <TouchableOpacity onPress={handleClearAll} className="p-2 -mr-2">
                <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            ) : undefined
          }
        />
      }
    >
      {/* Action Bar */}
      {notifications && notifications.length > 0 && (
        <View className="px-4 mb-2 flex-row justify-end">
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="font-kanit text-sm text-[#16AD78]">อ่านทั้งหมด</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16AD78']} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <MaterialCommunityIcons name="bell-sleep" size={64} color="#D1D5DB" />
              <Text className="font-kanit text-gray-500 mt-4 text-lg">ไม่มีการแจ้งเตือน</Text>
              <Text className="font-kanit text-gray-400 text-sm mt-1">
                เหตุการณ์ต่างๆ จะปรากฏที่นี่
              </Text>
            </View>
          ) : (
            <View className="py-20">
              <ActivityIndicator size="large" color="#16AD78" />
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
}
