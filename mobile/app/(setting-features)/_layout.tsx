import { Stack } from 'expo-router';

export default function SettingFeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <Stack.Screen name="members" options={{ title: 'จัดการสมาชิก' }} />
      <Stack.Screen name="invite-member" options={{ title: 'เชิญสมาชิก' }} />
      <Stack.Screen name="(device)/pairing" options={{ title: 'จับคู่อุปกรณ์' }} />
      <Stack.Screen name="(device)/wifi-config" options={{ title: 'ตั้งค่า WiFi' }} />
    </Stack>
  );
}
