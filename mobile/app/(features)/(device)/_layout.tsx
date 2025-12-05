import { Stack } from 'expo-router';

export default function DeviceLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="pairing" />
            <Stack.Screen name="wifi-config" />
        </Stack>
    );
}
