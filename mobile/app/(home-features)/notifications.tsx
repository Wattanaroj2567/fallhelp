import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Notifications() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontSize: 18 }} className="font-kanit text-gray-600">
          การแจ้งเตือน
        </Text>
      </View>
    </SafeAreaView>
  );
}