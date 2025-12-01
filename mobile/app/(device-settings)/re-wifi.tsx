import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { configureWifi } from '@/services/deviceService';
import * as SecureStore from 'expo-secure-store';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
const PASSWORD_ICON_SIZE = 24;

interface WiFiNetwork {
    ssid: string;
    signalStrength: number;
    isSecured: boolean;
}

export default function ReConfigureWiFiScreen() {
    const router = useRouter();

    const [showManualEntry, setShowManualEntry] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [wifiList, setWifiList] = useState<WiFiNetwork[]>([]);
    const [selectedWifi, setSelectedWifi] = useState<WiFiNetwork | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [manualSsid, setManualSsid] = useState('');
    const [manualPassword, setManualPassword] = useState('');

    const [manualSsidFocused, setManualSsidFocused] = useState(false);
    const [manualPasswordFocused, setManualPasswordFocused] = useState(false);
    const [modalPasswordFocused, setModalPasswordFocused] = useState(false);

    const useInputAnimation = (focused: boolean, value: string) => {
        const progress = useDerivedValue(
            () => withTiming(focused || !!value ? 1 : 0, { duration: 200 }),
            [focused, value]
        );

        const containerStyle = useAnimatedStyle(() => ({
            top: interpolate(progress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
            backgroundColor: progress.value > 0.5 ? '#FFFFFF' : 'transparent',
            paddingHorizontal: 4,
            zIndex: 1,
        }));

        const textStyle = useAnimatedStyle(() => ({
            fontSize: interpolate(progress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
            color: focused ? '#16AD78' : '#9CA3AF',
        }));

        return { containerStyle, textStyle };
    };

    const manualSsidAnim = useInputAnimation(manualSsidFocused, manualSsid);
    const manualPasswordAnim = useInputAnimation(manualPasswordFocused, manualPassword);
    const modalPasswordAnim = useInputAnimation(modalPasswordFocused, password);

    const scanWiFiNetworks = () => {
        setScanning(true);
        setTimeout(() => {
            const mockNetworks: WiFiNetwork[] = [
                { ssid: 'ฐานลับ', signalStrength: -45, isSecured: true },
                { ssid: 'TrueMove_5GHz', signalStrength: -60, isSecured: true },
                { ssid: 'AIS_Fiber_2.4G', signalStrength: -75, isSecured: false },
                { ssid: 'Home_WiFi', signalStrength: -55, isSecured: true },
            ];
            setWifiList(mockNetworks);
            setScanning(false);
        }, 2000);
    };

    const getSignalIcon = (strength: number) => {
        if (strength >= -50) return { icon: 'wifi', color: '#16AD78', bars: 4 };
        if (strength >= -60) return { icon: 'wifi', color: '#EAB308', bars: 3 };
        if (strength >= -70) return { icon: 'wifi', color: '#F59E0B', bars: 2 };
        return { icon: 'wifi', color: '#EF4444', bars: 1 };
    };

    const configureWifiMutation = useMutation({
        mutationFn: async (payload: { ssid: string; wifiPassword: string }) => {
            // In re-configuration, we assume the user is managing the currently active device
            // We might need to fetch the device ID from context or storage
            // For now, we'll try to get it from SecureStore if it persists, or assume a mock ID for demo
            let deviceId = await SecureStore.getItemAsync('setup_deviceId');
            if (!deviceId) {
                // Fallback or error handling for demo purposes
                // In a real app, we would pass deviceId via params or context
                deviceId = "mock-device-id";
            }

            return await configureWifi(deviceId, payload);
        },
        onSuccess: async () => {
            Alert.alert(
                'ตั้งค่า WiFi สำเร็จ',
                'อัปเดตการเชื่อมต่อ WiFi เรียบร้อยแล้ว',
                [
                    {
                        text: 'ตกลง',
                        onPress: () => router.back(),
                    },
                ]
            );
        },
        onError: (error: any) => {
            console.error('Error configuring WiFi:', error);
            Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเชื่อมต่อ WiFi ได้');
        },
    });

    const handleWiFiSelect = (network: WiFiNetwork) => {
        if (network.isSecured) {
            setSelectedWifi(network);
            setPassword('');
        } else {
            Alert.alert(
                'เชื่อมต่อ WiFi',
                `คุณต้องการเชื่อมต่อกับ "${network.ssid}" ใช่หรือไม่?`,
                [
                    { text: 'ยกเลิก', style: 'cancel' },
                    { text: 'เชื่อมต่อ', onPress: () => connectToWiFi(network.ssid, '') },
                ]
            );
        }
    };

    const connectToWiFi = async (ssid: string, pwd: string) => {
        setSelectedWifi(null);
        configureWifiMutation.mutate({ ssid, wifiPassword: pwd });
    };

    const handleManualConnect = () => {
        if (!manualSsid.trim()) {
            Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อ WiFi (SSID)');
            return;
        }
        connectToWiFi(manualSsid, manualPassword);
    };

    React.useEffect(() => {
        scanWiFiNetworks();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
                    ตั้งค่า WiFi ใหม่
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    className="flex-1 px-6 pt-6"
                    contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600 mb-6">
                        เลือก WiFi จากรายการ หรือกรอกด้วยตนเองสำหรับเครือข่ายที่ซ่อน SSID
                    </Text>

                    {!showManualEntry ? (
                        <>
                            <View className="flex-row justify-between items-center mb-4">
                                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-900">
                                    รายการ WiFi ที่พบ
                                </Text>
                                <TouchableOpacity
                                    onPress={scanWiFiNetworks}
                                    disabled={scanning}
                                    className="flex-row items-center"
                                >
                                    <Ionicons name="refresh" size={20} color={scanning ? '#9CA3AF' : '#16AD78'} />
                                    <Text style={{ fontSize: 14 }} className="font-kanit text-[#16AD78] ml-1">
                                        รีเฟรช
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {scanning ? (
                                <View className="items-center justify-center py-12">
                                    <ActivityIndicator size="large" color="#16AD78" />
                                    <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600 mt-4">
                                        กำลังค้นหาเครือข่าย WiFi...
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {wifiList.map((network, index) => {
                                        const signal = getSignalIcon(network.signalStrength);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleWiFiSelect(network)}
                                                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-200"
                                            >
                                                <Ionicons name={signal.icon as any} size={24} color={signal.color} />
                                                <View className="flex-1 ml-3">
                                                    <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-gray-900">
                                                        {network.ssid}
                                                    </Text>
                                                    <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500">
                                                        {network.isSecured ? '🔒 WPA2' : '🔓 Open'}
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        );
                                    })}

                                    <TouchableOpacity
                                        onPress={() => setShowManualEntry(true)}
                                        className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center justify-center border border-gray-300"
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color="#16AD78" />
                                        <Text style={{ fontSize: 16 }} className="font-kanit text-gray-700 ml-2">
                                            กรอก WiFi ด้วยตนเอง
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
                                <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
                                    สำหรับ WiFi ที่ซ่อน SSID หรือไม่ปรากฏในรายการ
                                </Text>
                            </View>

                            <View className="mb-4">
                                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                                    <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, manualSsidAnim.containerStyle]}>
                                        <Animated.Text className="font-kanit" style={[manualSsidAnim.textStyle]}>ชื่อ WiFi (SSID)</Animated.Text>
                                    </Animated.View>
                                    <TextInput
                                        className={`font-kanit h-[60px] rounded-2xl px-4 border ${manualSsidFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                                        style={{
                                            fontFamily: 'Kanit',
                                            height: 60,
                                            paddingTop: 18,
                                            paddingBottom: 18,
                                            textAlignVertical: 'center',
                                            includeFontPadding: false,
                                        }}
                                        placeholderTextColor="#9CA3AF"
                                        value={manualSsid}
                                        onChangeText={setManualSsid}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        onFocus={() => setManualSsidFocused(true)}
                                        onBlur={() => setManualSsidFocused(false)}
                                    />
                                </View>
                            </View>

                            <View className="mb-6">
                                <View
                                    style={{ height: INPUT_HEIGHT, position: 'relative' }}
                                    className={`rounded-2xl px-4 border ${manualPasswordFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white justify-center`}
                                >
                                    <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, manualPasswordAnim.containerStyle]}>
                                        <Animated.Text className="font-kanit" style={[manualPasswordAnim.textStyle]}>รหัสผ่าน WiFi</Animated.Text>
                                    </Animated.View>
                                    <TextInput
                                        className="flex-1 font-kanit text-gray-900 text-[16px] pr-10"
                                        style={{
                                            fontFamily: 'Kanit',
                                            paddingTop: 18,
                                            paddingBottom: 18,
                                            height: '100%',
                                            textAlignVertical: 'center',
                                            includeFontPadding: false,
                                            lineHeight: 24,
                                        }}
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={manualPassword}
                                        onChangeText={setManualPassword}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        onFocus={() => setManualPasswordFocused(true)}
                                        onBlur={() => setManualPasswordFocused(false)}
                                        textContentType="password"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4"
                                        style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={PASSWORD_ICON_SIZE} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleManualConnect}
                                className="bg-[#16AD78] rounded-2xl py-4 items-center mb-4"
                            >
                                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                                    เชื่อมต่อ
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowManualEntry(false)}
                                className="items-center py-2"
                            >
                                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600">
                                    ย้อนกลับไปเลือกจากรายการ
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={selectedWifi !== null} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <Text style={{ fontSize: 18, fontWeight: '600' }} className="text-gray-900 mb-4">
                            เชื่อมต่อกับ "{selectedWifi?.ssid}"
                        </Text>

                        <View className="mb-6">
                            <Text style={{ fontSize: 14 }} className="text-gray-700 mb-2">
                                รหัสผ่าน WiFi
                            </Text>
                            <View className="relative">
                                <View
                                    style={{ height: INPUT_HEIGHT, position: 'relative' }}
                                    className={`rounded-2xl px-4 border ${modalPasswordFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-gray-50 justify-center`}
                                >
                                    <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, modalPasswordAnim.containerStyle]}>
                                        <Animated.Text className="font-kanit" style={[modalPasswordAnim.textStyle]}>รหัสผ่าน WiFi</Animated.Text>
                                    </Animated.View>
                                    <TextInput
                                        className="flex-1 font-kanit text-gray-900 text-[16px] pr-10"
                                        style={{
                                            fontFamily: 'Kanit',
                                            paddingTop: 18,
                                            paddingBottom: 18,
                                            height: '100%',
                                            textAlignVertical: 'center',
                                            includeFontPadding: false,
                                            lineHeight: 24,
                                        }}
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        autoFocus
                                        onFocus={() => setModalPasswordFocused(true)}
                                        onBlur={() => setModalPasswordFocused(false)}
                                        textContentType="password"
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4"
                                        style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={PASSWORD_ICON_SIZE} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setSelectedWifi(null)}
                                className="flex-1 bg-gray-200 rounded-2xl py-3 items-center"
                            >
                                <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-gray-700">
                                    ยกเลิก
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (selectedWifi) {
                                        connectToWiFi(selectedWifi.ssid, password);
                                    }
                                }}
                                className="flex-1 bg-[#16AD78] rounded-2xl py-3 items-center"
                            >
                                <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-white">
                                    เชื่อมต่อ
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={configureWifiMutation.isPending} transparent>
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-3xl p-8 items-center">
                        <ActivityIndicator size="large" color="#16AD78" />
                        <Text style={{ fontSize: 16 }} className="text-gray-900 mt-4">
                            กำลังเชื่อมต่อ WiFi กับอุปกรณ์...
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
