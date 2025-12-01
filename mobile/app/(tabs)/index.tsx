import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserElders as getElders } from '@/services/userService';
import { listEvents } from '@/services/eventService';
import { useSocket } from '@/hooks/useSocket';

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Pure functions for data formatting
// ==========================================
const formatTime = (date: Date | null) => {
  if (!date) return '--:-- น.';
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
};

const calculateAge = (dobString?: string) => {
  if (!dobString) return '--';
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Main Dashboard Screen
// ==========================================
export default function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder Data & Initial Events using React Query
  // ==========================================

  // 1. Fetch Elder Profile
  const { data: elderInfo, isLoading, refetch } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // 2. Fetch Initial Events (for initial state before socket updates)
  const { data: initialEvents } = useQuery({
    queryKey: ['initialEvents', elderInfo?.id],
    queryFn: async () => {
      if (!elderInfo?.id) return null;
      const response = await listEvents({ elderId: elderInfo.id, pageSize: 20, page: 1 });
      return response.data || [];
    },
    enabled: !!elderInfo?.id,
  });

  // ==========================================
  // 🔌 LAYER: Logic (Real-time / Side Effects)
  // Purpose: Handle Socket.IO connection and updates
  // ==========================================
  const {
    isConnected,
    fallStatus,
    lastFallUpdate,
    heartRate,
    lastHeartUpdate,
    setFallStatus,
    setLastFallUpdate,
    setHeartRate,
    setLastHeartUpdate,
    setIsConnected
  } = useSocket(elderInfo?.id, elderInfo?.device?.id);

  // Sync Device Status
  useEffect(() => {
    if (elderInfo?.device) {
      const deviceStatus = elderInfo.device.status;
      const online = deviceStatus === 'ACTIVE' || deviceStatus === 'PAIRED';
      setIsConnected(online);
    } else {
      setIsConnected(false);
    }
  }, [elderInfo, setIsConnected]);

  // Sync Initial Event Data
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      const latestHR = initialEvents.find((e) => ['HEART_RATE_NORMAL', 'HEART_RATE_HIGH', 'HEART_RATE_LOW'].includes(e.type));
      if (latestHR && latestHR.value) {
        setHeartRate(latestHR.value);
        setLastHeartUpdate(new Date(latestHR.timestamp));
      }

      const latestFall = initialEvents.find((e) => e.type === 'FALL');
      if (latestFall) {
        setLastFallUpdate(new Date(latestFall.timestamp));
        setFallStatus(latestFall.isCancelled ? 'NORMAL' : 'FALL');
      } else {
        setFallStatus('NORMAL');
      }
    }
  }, [initialEvents, setHeartRate, setLastHeartUpdate, setFallStatus, setLastFallUpdate]);

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user interactions
  // ==========================================
  const onRefresh = async () => {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ['initialEvents'] })
    ]);
  };

  // UI Logic: Calculate Status Colors/Labels
  const hrStatus = (() => {
    if (heartRate === null) return { label: '--', color: '#9CA3AF' };
    if (heartRate < 60) return { label: 'ต่ำกว่าเกณฑ์', color: '#1E88E5' };
    if (heartRate > 100) return { label: 'สูงกว่าปกติ', color: '#EF4A5A' };
    return { label: 'ปกติ', color: '#4A90E2' };
  })();

  const getFallStatusColor = () => {
    if (fallStatus === 'FALL') return '#EF4A5A';
    if (isConnected) return '#4A90E2';
    return '#9CA3AF';
  };

  // ==========================================
  // 🖼️ LAYER: View (Render)
  // Purpose: Render the UI JSX
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>

      {/* Header Section */}
      <View className="flex-row items-center justify-between pt-3 pb-4 bg-white px-6">
        <Text className="font-kanit text-2xl font-bold text-gray-800">
          FallHelp
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(home-features)/(profile)')}
          className="p-1"
        >
          <Ionicons name="person-circle-outline" size={36} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {!elderInfo ? (
          // Empty State UI
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="person-add-outline" size={80} color="#D1D5DB" />
            <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900 mt-6">
              ยินดีต้อนรับสู่ FallHelp
            </Text>
            <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500 mt-2 text-center">
              คุณยังไม่มีข้อมูลในระบบ
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(setup)/empty-state')}
              className="bg-[#16AD78] rounded-2xl px-8 py-4 mt-8"
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                เพิ่มอุปกรณ์และเริ่มต้นใช้งาน
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Main Dashboard UI
          <>
            <Text className="font-kanit text-lg font-bold text-black mb-4">
              ภาพรวม
            </Text>

            {/* Card 1: Device Status */}
            <View className="bg-[#F5F6F7] rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="font-kanit text-base font-bold text-gray-800 mb-3">
                สถานะของอุปกรณ์
              </Text>
              <View
                className="w-full py-3 rounded-xl items-center"
                style={{ backgroundColor: elderInfo?.device ? (isConnected ? '#56AE57' : '#9CA3AF') : '#9CA3AF' }}
              >
                <Text className="font-kanit text-white text-lg font-bold">
                  {elderInfo?.device ? (isConnected ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ') : '--'}
                </Text>
              </View>
            </View>

            {/* Card 2: Fall Status */}
            <View className="bg-[#F5F6F7] rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="font-kanit text-base font-bold text-gray-800 mb-1">
                    สถานะการหกล้ม
                  </Text>
                  <Text className="font-kanit text-sm text-gray-500">
                    อัปเดตล่าสุด : <Text className="font-kanit text-gray-800 font-medium">
                      {elderInfo?.device ? formatTime(lastFallUpdate) : '--:-- น.'}
                    </Text>
                  </Text>
                </View>
                <View
                  className="px-6 py-1.5 rounded-lg"
                  style={{ backgroundColor: getFallStatusColor() }}
                >
                  <Text className="font-kanit text-white font-bold text-base">
                    {elderInfo?.device ? (fallStatus === 'FALL' ? 'หกล้ม!' : (isConnected ? 'ปกติ' : '--')) : '--'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card 3: Heart Rate */}
            <View className="bg-[#F5F6F7] rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="font-kanit text-base font-bold text-gray-800 mb-1">
                    สถานะของชีพจร
                  </Text>
                  <Text className="font-kanit text-sm text-gray-500">
                    อัปเดตล่าสุด : <Text className="font-kanit text-gray-800 font-medium">
                      {elderInfo?.device ? formatTime(lastHeartUpdate) : '--:-- น.'}
                    </Text>
                  </Text>
                </View>
                <View className="px-6 py-1.5 rounded-lg" style={{ backgroundColor: hrStatus.color }}>
                  <Text className="font-kanit text-white font-bold text-base">
                    {elderInfo?.device ? hrStatus.label : '--'}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                {elderInfo?.device && heartRate !== null ? (
                  <View className="bg-[#EF4A5A] px-4 py-2 rounded-xl flex-row items-center shadow-sm">
                    <Ionicons name="heart" size={20} color="white" style={{ marginRight: 6 }} />
                    <Text className="font-kanit text-white text-xl font-bold">
                      {Math.round(heartRate)} BPM
                    </Text>
                  </View>
                ) : (
                  <Text className="font-kanit text-gray-400 text-lg">-- BPM</Text>
                )}
              </View>
            </View>

            {/* Card 4: Elder Info */}
            <View className="bg-[#F5F6F7] rounded-2xl p-5 mb-20 shadow-sm border border-gray-100">
              <Text className="font-kanit text-sm font-bold text-gray-600 mb-4">
                ข้อมูลผู้สูงอายุ
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(home-features)/(elderly)')}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center">
                    <Ionicons name="person" size={24} color="#FFF" />
                  </View>
                  <View>
                    <View className="flex-row mb-2">
                      <Text className="font-kanit w-16 text-gray-500">ชื่อ</Text>
                      <Text className="font-kanit text-gray-800 font-medium">
                        {elderInfo ? `${elderInfo.firstName} ${elderInfo.lastName}` : '--'}
                      </Text>
                    </View>
                    <View className="flex-row mb-2">
                      <Text className="font-kanit w-16 text-gray-500">เพศ</Text>
                      <Text className="font-kanit text-gray-800 font-medium">
                        {elderInfo?.gender === 'FEMALE' ? 'หญิง' : (elderInfo?.gender === 'MALE' ? 'ชาย' : '--')}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="font-kanit w-16 text-gray-500">อายุ</Text>
                      <Text className="font-kanit text-gray-800 font-medium">
                        {elderInfo?.dateOfBirth ? `${calculateAge(elderInfo.dateOfBirth)} ปี` : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-4 left-0 right-0 px-6 pb-4 bg-transparent">
        <TouchableOpacity
          activeOpacity={0.9}
          className="w-full bg-[#FF4444] rounded-2xl py-4 flex-row justify-center items-center shadow-lg"
          onPress={() => router.push('/(home-features)/call')}
          style={{
            shadowColor: '#FF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}
        >
          <MaterialCommunityIcons name="phone-in-talk" size={24} color="white" style={{ marginRight: 8 }} />
          <Text className="font-kanit text-white text-lg font-bold">
            โทรฉุกเฉิน
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}