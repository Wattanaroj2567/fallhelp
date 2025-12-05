import { Stack } from 'expo-router';

export default function UserLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(profile)" />
            <Stack.Screen name="members" />
            <Stack.Screen name="invite-member" />
            <Stack.Screen name="feedback" />
        </Stack>
    );
}
