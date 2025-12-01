import { Stack } from 'expo-router';

// ==========================================
// 📱 LAYER: View (Layout)
// Purpose: Setup Stack Layout
// ==========================================
export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerTitleAlign: 'center' }}>
      <Stack.Screen name="empty-state" options={{ title: 'เริ่มต้นใช้งาน', headerShown: false }} />
      <Stack.Screen name="step1-elder-info" options={{ title: 'ข้อมูลผู้สูงอายุ' }} />
      <Stack.Screen name="step2-device-pairing" options={{ title: 'จับคู่เครื่อง' }} />
      <Stack.Screen name="step3-wifi-setup" options={{ title: 'ตั้งค่า Wi-Fi' }} />
      <Stack.Screen name="saved-success" options={{ title: 'เสร็จสิ้น', headerShown: false }} />
    </Stack>
  );
}
