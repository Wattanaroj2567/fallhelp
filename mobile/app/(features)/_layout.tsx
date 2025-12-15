import { Stack } from 'expo-router';

export default function FeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ FIX: Screens are accessed explicitly via navigation, no default index needed */}
      <Stack.Screen name="(elder)" />
      <Stack.Screen name="(device)" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(emergency)" />
      <Stack.Screen name="(monitoring)" />
    </Stack>
  );
}
