
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { pairDevice } from '@/services/deviceService';
import * as SecureStore from 'expo-secure-store';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 2 of Setup - Device Pairing
// ==========================================
export default function Step2() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage pairing state
  // ==========================================
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [macAddress, setMacAddress] = useState('');
  // showCamera is no longer needed as state, we default to camera view

  // Focus State
  const [macFocused, setMacFocused] = useState(false);

  // Request permission on mount
  React.useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      // Permission denied permanently
    } else if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Animation Hooks
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

  const macAnim = useInputAnimation(macFocused, macAddress);

  const formatMacAddress = (text: string) => {
    const cleaned = text.replace(/[^0-9A-Fa-f]/g, '');
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
    return formatted.toUpperCase().slice(0, 17);
  };

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Pair device with elder
  // ==========================================
  const pairMutation = useMutation({
    mutationFn: async (deviceCode: string) => {
      const elderId = await SecureStore.getItemAsync('setup_elderId');
      if (!elderId) throw new Error('ไม่พบข้อมูลผู้สูงอายุ กรุณากลับไปทำขั้นตอนที่ 1 ใหม่');
      return await pairDevice({ deviceCode, elderId });
    },
    onSuccess: async (device) => {
      await SecureStore.setItemAsync('setup_deviceId', String(device.id));
      await SecureStore.setItemAsync('setup_step', '3');
      Alert.alert(
        'เชื่อมต่ออุปกรณ์สำเร็จ',
        'เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => router.push('/(setup)/step3-wifi-setup') }]
      );
    },
    onError: (error: any) => {
      console.error('Error pairing device:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเชื่อมต่ออุปกรณ์ได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle pairing actions
  // ==========================================
  const handleManualPairing = async () => {
    if (!macAddress || macAddress.length < 8) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัสอุปกรณ์ 8 หลัก');
      return;
    }
    pairMutation.mutate(macAddress);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Prevent multiple scans
    if (pairMutation.isPending) return;
    pairMutation.mutate(data);
  };

  // ==========================================
  // 🧩 LAYER: Logic (Navigation & State)
  // ==========================================
  const handleBack = async () => {
    if (showManualEntry) {
      setShowManualEntry(false);
    } else {
      // Clear the saved step
      await SecureStore.deleteItemAsync('setup_step');
      // Use back() to support native swipe gesture and history
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(setup)/step1-elder-info');
      }
    }
  };

  // ==========================================
  // 🎨 LAYER: UI Components (Shared)
  // ==========================================
  const renderHeader = (isTransparent: boolean) => (
    <View
      className={`${isTransparent ? 'bg-black/30' : 'bg-white'} rounded-b-[32px] overflow-hidden pb-4 mb-4`}
      style={{ paddingTop: isTransparent ? insets.top : 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color={isTransparent ? "white" : "#374151"} />
        </TouchableOpacity>
        <Text className={`font-kanit text-xl font-bold ${isTransparent ? "text-white" : "text-gray-900"}`}>
          ติดตั้งอุปกรณ์
        </Text>
        <View className="w-8" />
      </View>

      {/* Progress Bar */}
      <View className="px-6">
        <View className="relative">
          {/* Connecting Line (Background) */}
          <View
            className={`absolute top-4 left-[16%] right-[16%] h-[2px] ${isTransparent ? 'bg-white/20' : 'bg-gray-200'}`}
            style={{ zIndex: 0 }}
          />
          <View
            className="absolute top-4 left-[16%] right-[50%] h-[2px] bg-[#16AD78]"
            style={{ zIndex: 1 }}
          />

          {/* Steps (Foreground) */}
          <View className="flex-row justify-between">
            {/* Step 1 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-[#16AD78] items-center justify-center z-10 mb-2 shadow-sm border border-[#16AD78]">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12 }} className={`${isTransparent ? 'text-green-400' : 'text-green-600'} text-center font-kanit`}>
                กรอกข้อมูล{'\n'}ผู้สูงอายุ
              </Text>
            </View>

            {/* Step 2 */}
            <View className="flex-1 items-center">
              <View className={`w-8 h-8 rounded-full ${isTransparent ? 'bg-blue-500 border-blue-400' : 'bg-blue-600 border-blue-600'} items-center justify-center z-10 mb-2 shadow-sm border`}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-white font-kanit">2</Text>
              </View>
              <Text style={{ fontSize: 12 }} className={`${isTransparent ? 'text-blue-300' : 'text-blue-600'} text-center font-kanit`}>
                ติดตั้งอุปกรณ์
              </Text>
            </View>

            {/* Step 3 */}
            <View className="flex-1 items-center">
              <View className={`w-8 h-8 rounded-full ${isTransparent ? 'bg-black/40 border-white/30' : 'bg-white border-gray-200'} border-2 items-center justify-center z-10 mb-2`}>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-gray-400 font-kanit">3</Text>
              </View>
              <Text style={{ fontSize: 12 }} className="text-gray-400 text-center font-kanit">
                ตั้งค่า WiFi
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // 🖼️ LAYER: View (Manual Entry Mode)
  // ==========================================
  if (showManualEntry) {
    return (
      <View className="flex-1 bg-white">
        {/* Use SafeAreaView only for top padding simulation if needed, or just View with insets */}
        <View style={{ height: insets.top, backgroundColor: 'white' }} />

        {renderHeader(false)}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-6">
              <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700 mb-2">
                กรุณากรอกรหัสอุปกรณ์ 8 หลัก
              </Text>
              <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
                ที่ติดบนสติ๊กเกอร์ของอุปกรณ์
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-blue-900 mt-2">
                ตัวอย่าง: 832CE051
              </Text>
            </View>

            <View className="items-center mb-6">
              <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Ionicons name="hardware-chip-outline" size={64} color="#16AD78" />
              </View>
            </View>

            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, macAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[macAnim.textStyle]}>รหัสอุปกรณ์ (Device Code)</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${macFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={macAddress}
                  onChangeText={(text) => setMacAddress(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  autoCapitalize="characters"
                  maxLength={8}
                  onFocus={() => setMacFocused(true)}
                  onBlur={() => setMacFocused(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleManualPairing}
              disabled={pairMutation.isPending}
              className="bg-[#16AD78] rounded-2xl py-4 items-center mb-4"
              style={{ opacity: pairMutation.isPending ? 0.6 : 1 }}
            >
              {pairMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  ยืนยัน
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowManualEntry(false)}
              className="items-center py-2"
            >
              <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600">
                ย้อนกลับไปสแกน QR Code
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ==========================================
  // 📸 LAYER: View (Camera Mode)
  // ==========================================
  return (
    <View className="flex-1 bg-black">
      {/* Background Camera Layer */}
      {permission?.granted && (
        <CameraView
          style={[StyleSheet.absoluteFill]}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      {/* UI Overlay Layer */}
      <View className="flex-1">

        {renderHeader(true)}

        {/* Camera Overlay Content */}
        <View className="flex-1 justify-between pb-10">
          {/* Center Scanning Area */}
          <View className="flex-1 items-center justify-center">
            {!permission?.granted ? (
              <View className="items-center px-6">
                <Text className="font-kanit text-white text-center mb-6 text-lg">
                  ต้องการสิทธิ์การเข้าถึงกล้องเพื่อสแกน QR Code
                </Text>
                <TouchableOpacity
                  onPress={requestPermission}
                  className="bg-[#16AD78] px-8 py-3 rounded-full shadow-lg"
                >
                  <Text className="font-kanit text-white font-bold text-base">อนุญาตให้ใช้กล้อง</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="w-72 h-72 relative">
                  {/* Corner Borders */}
                  <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#16AD78] rounded-tl-2xl" />
                  <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#16AD78] rounded-tr-2xl" />
                  <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#16AD78] rounded-bl-2xl" />
                  <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#16AD78] rounded-br-2xl" />

                  {/* Scanning Animation Line */}
                  <View className="absolute top-1/2 left-4 right-4 h-[1px] bg-[#16AD78]/50" />
                </View>

                <View className="mt-8 bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md">
                  <Text className="font-kanit text-white text-lg text-center font-semibold">
                    สแกน QR Code
                  </Text>
                  <Text className="font-kanit text-gray-200 text-sm text-center mt-1">
                    วาง QR Code ให้อยู่ในกรอบเพื่อเชื่อมต่อ
                  </Text>
                  {pairMutation.isError && (
                    <Text className="font-kanit text-red-400 text-sm text-center mt-2">
                      ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Bottom Action */}
          <View className="px-6 items-center">
            <TouchableOpacity
              onPress={() => setShowManualEntry(true)}
              className="flex-row items-center bg-white/20 px-6 py-4 rounded-full border border-white/30 backdrop-blur-md shadow-lg active:bg-white/30"
            >
              <Ionicons name="keypad" size={20} color="white" />
              <Text className="font-kanit text-white ml-3 font-semibold text-base">
                กรอกรหัสอุปกรณ์ด้วยตนเอง
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
