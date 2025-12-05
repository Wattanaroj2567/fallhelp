import { Stack } from 'expo-router';

// ==========================================
// 📱 LAYER: View (Layout)
// Purpose: Auth Stack Layout
// ==========================================
export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
