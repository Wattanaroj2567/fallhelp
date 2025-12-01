import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-xl font-kanit-bold text-gray-900">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-3">
          <Text className="text-base font-kanit-semibold text-sky-600">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
