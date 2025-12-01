import { Stack } from 'expo-router';

// ==========================================
// 📱 LAYER: View (Layout)
// Purpose: Auth Stack Layout
// ==========================================
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}
