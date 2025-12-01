import { useRouter } from 'expo-router';
import { Text, View, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { logout } from '@/services/authService';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Settings Screen
// ==========================================
export default function SettingsScreen() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle logout API call
  // ==========================================
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      router.replace('/(auth)/login');
    },
    onError: () => {
      Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user actions
  // ==========================================
  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'ยืนยันการออกจากระบบของคุณหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ใช่',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    isLast = false,
    isDanger = false
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    isLast?: boolean;
    isDanger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between py-5 ${!isLast ? 'border-b border-gray-200' : ''}`}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons
          name={icon as any}
          size={24}
          color={isDanger ? '#EF4444' : '#9CA3AF'}
        />
        <Text
          style={{ fontSize: 16 }}
          className={`font-kanit ml-4 ${isDanger ? 'text-red-500' : 'text-gray-900'}`}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render settings menu
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text style={{ fontSize: 24, fontWeight: '700' }} className="font-kanit text-gray-900">
          ตั้งค่า
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Settings Section */}
        <View className="bg-white mt-6 px-6">
          <MenuItem
            icon="wifi-outline"
            title="ตั้งค่าการเชื่อม WiFi ใหม่"
            onPress={() => router.push('/(device-settings)/re-wifi' as any)}
          />
          <MenuItem
            icon="hardware-chip-outline"
            title="ตั้งค่าการเชื่อมอุปกรณ์ใหม่"
            onPress={() => router.push('/(device-settings)/re-pair' as any)}
          />
          <MenuItem
            icon="people-outline"
            title="จัดการสมาชิก"
            onPress={() => router.push('/(setting-features)/members' as any)}
          />
          <MenuItem
            icon="chatbox-ellipses-outline"
            title="ส่งความคิดเห็น / แจ้งปัญหา"
            onPress={() => router.push('/(setting-features)/feedback' as any)}
          />
          <MenuItem
            icon="log-out-outline"
            title="ออกจากระบบ"
            onPress={handleLogout}
            isLast={true}
            isDanger={true}
          />
        </View>

        {/* App Info */}
        <View className="mt-8 px-6 items-center pb-8">
          <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500">
            FallHelp v1.0.0
          </Text>
          <Text style={{ fontSize: 10 }} className="font-kanit text-gray-400 mt-1">
            © 2025 Fall Detection System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
