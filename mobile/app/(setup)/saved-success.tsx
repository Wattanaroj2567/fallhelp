import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Success Screen for Setup Flow
// ==========================================
export default function SetupSuccess() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white px-6 py-8 items-center justify-center">
      <Text className="text-xl font-bold text-emerald-600">บันทึกสำเร็จ!</Text>
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="mt-4 bg-gray-100 p-3 rounded-lg">
        <Text className="text-black text-center">ไปที่หน้าหลัก</Text>
      </TouchableOpacity>
    </View>
  );
}
