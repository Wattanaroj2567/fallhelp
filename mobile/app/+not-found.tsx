import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'ไม่พบหน้านี้', headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-xl font-kanit text-gray-900">ไม่พบหน้านี้</Text>
        <Text className="text-base font-kanit text-gray-500 mt-2 text-center">
          หน้าที่คุณต้องการยังไม่มีหรือถูกลบไปแล้ว
        </Text>
        <Link href="/(tabs)" className="mt-6 py-3 px-6 bg-[#16AD78] rounded-2xl">
          <Text className="text-base font-kanit text-white font-semibold">กลับหน้าหลัก</Text>
        </Link>
      </View>
    </>
  );
}
