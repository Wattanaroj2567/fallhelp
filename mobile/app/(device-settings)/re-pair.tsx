import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { pairDevice, unpairDevice } from '@/services/deviceService';
import * as SecureStore from 'expo-secure-store';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Reusing logic from Step 2 but adapted for re-pairing
export default function RePairDeviceScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();
    const insets = useSafeAreaInsets();

    const [showManualEntry, setShowManualEntry] = useState(false);
    const [deviceCode, setDeviceCode] = useState('');

    // Request permission on mount
    React.useEffect(() => {
        if (permission && !permission.granted && !permission.canAskAgain) {
            // Permission denied permanently
        } else if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const pairMutation = useMutation({
        mutationFn: async (code: string) => {
            // In a real app, we might need to unpair the old device first or just overwrite
            // For now, we assume we are pairing a new device to the current elder
            // We need to get the current elder ID from storage or context
            // For simplicity, we'll ask the user to confirm if they want to replace the existing device
            const elderId = await SecureStore.getItemAsync('current_elder_id');
            if (!elderId) throw new Error('ไม่พบข้อมูลผู้สูงอายุ');

            return await pairDevice({ deviceCode: code, elderId });
        },
        onSuccess: async (device) => {
            Alert.alert(
                'เชื่อมต่อสำเร็จ',
                'จับคู่อุปกรณ์ใหม่เรียบร้อยแล้ว',
                [{ text: 'ตกลง', onPress: () => router.back() }]
            );
        },
        onError: (error: any) => {
            Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเชื่อมต่ออุปกรณ์ได้');
        },
    });

    const handleManualPairing = () => {
        if (!deviceCode || deviceCode.length < 8) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัสอุปกรณ์ 8 หลัก');
            return;
        }
        pairMutation.mutate(deviceCode);
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (pairMutation.isPending) return;
        pairMutation.mutate(data);
    };

    return (
        <View className="flex-1 bg-black">
            {/* Camera View */}
            {permission?.granted && !showManualEntry && (
                <CameraView
                    style={[StyleSheet.absoluteFill]}
                    facing="back"
                    onBarcodeScanned={handleBarCodeScanned}
                />
            )}

            {/* UI Overlay */}
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="flex-row items-center justify-between px-6 py-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/40 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="font-kanit text-white text-lg font-bold">จับคู่อุปกรณ์ใหม่</Text>
                    <View className="w-10" />
                </View>

                {showManualEntry ? (
                    <View className="flex-1 bg-white rounded-t-[32px] mt-4 px-6 pt-8">
                        <Text className="font-kanit text-xl font-bold text-gray-900 mb-2">กรอกรหัสอุปกรณ์</Text>
                        <Text className="font-kanit text-gray-500 mb-6">รหัส 8 หลักที่ติดอยู่บนอุปกรณ์</Text>

                        <TextInput
                            className="font-kanit bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg mb-6"
                            placeholder="เช่น 832CE051"
                            value={deviceCode}
                            onChangeText={(t) => setDeviceCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                            autoCapitalize="characters"
                            maxLength={8}
                        />

                        <TouchableOpacity
                            onPress={handleManualPairing}
                            disabled={pairMutation.isPending}
                            className="bg-[#16AD78] rounded-xl py-4 items-center"
                        >
                            {pairMutation.isPending ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-kanit text-white font-bold text-lg">ยืนยัน</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowManualEntry(false)} className="mt-4 items-center py-2">
                            <Text className="font-kanit text-gray-500">ใช้กล้องสแกน QR Code</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <View className="w-64 h-64 border-2 border-[#16AD78] rounded-3xl bg-transparent" />
                        <Text className="font-kanit text-white mt-8 text-center px-10">
                            สแกน QR Code ที่ตัวอุปกรณ์เพื่อจับคู่ใหม่
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowManualEntry(true)}
                            className="absolute bottom-10 bg-white px-6 py-3 rounded-full"
                        >
                            <Text className="font-kanit text-[#16AD78] font-bold">กรอกรหัสเอง</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
