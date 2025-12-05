import { Stack } from 'expo-router';

export default function MonitoringLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="report-summary" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
