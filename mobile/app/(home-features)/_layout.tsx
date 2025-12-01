import { Stack } from 'expo-router';

export default function HomeFeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="call" options={{ title: 'โทรฉุกเฉิน' }} />
      <Stack.Screen name="(profile)/index" options={{ title: 'โปรไฟล์' }} />
      <Stack.Screen name="(profile)/edit-info" options={{ title: 'แก้ไขข้อมูล' }} />
      <Stack.Screen name="(profile)/change-email" options={{ title: 'เปลี่ยนอีเมล' }} />
      <Stack.Screen name="(profile)/change-password" options={{ title: 'เปลี่ยนรหัสผ่าน' }} />
      <Stack.Screen name="(emergency)/index" options={{ title: 'ผู้ติดต่อฉุกเฉิน' }} />
      <Stack.Screen name="(emergency)/add" options={{ title: 'เพิ่มผู้ติดต่อ' }} />
      <Stack.Screen name="(emergency)/edit" options={{ title: 'แก้ไขผู้ติดต่อ' }} />
      <Stack.Screen name="(elderly)/index" options={{ title: 'ข้อมูลผู้สูงอายุ' }} />
      <Stack.Screen name="(elderly)/edit" options={{ title: 'แก้ไขข้อมูล' }} />
      <Stack.Screen name="notifications" options={{ title: 'การแจ้งเตือน' }} />
    </Stack>
  );
}
