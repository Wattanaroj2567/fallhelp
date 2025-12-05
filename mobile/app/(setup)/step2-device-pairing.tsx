
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { pairDevice } from '@/services/deviceService';
import * as SecureStore from 'expo-secure-store';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CameraView, useCameraPermissions } from 'expo-camera';

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

  // Request permission on mount
  React.useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      // Permission denied permanently
    } else if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);



  // Format device code: 8 alphanumeric characters only
  const formatDeviceCode = (text: string) => {
    const cleaned = text.replace(/[^0-9A-Za-z]/g, '');
    return cleaned.toUpperCase().slice(0, 8);
  };

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Pair device with elder
  // ==========================================
  // Lock to prevent multiple rapid scans
  const isScanning = React.useRef(false);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Pair device with elder
  // ==========================================
  const pairMutation = useMutation({
    mutationFn: async (deviceCode: string) => {
      let elderId = await SecureStore.getItemAsync('setup_elderId');
      Logger.debug('Step 2: Retrieved elderId from store:', elderId);

      // Check for invalid values
      if (!elderId || elderId === 'undefined' || elderId === 'null') {
        Logger.debug('Step 2: Invalid elderId, attempting fallback fetch...');
        // Fallback: Fetch from API
        try {
          const { getUserElders } = require('../../services/userService');
          const response = await getUserElders();
          // Handle both direct array and { data: [] } structure
          const eldersList = Array.isArray(response) ? response : (response.data || []);

          if (eldersList && eldersList.length > 0) {
            elderId = String(eldersList[0].id);
            Logger.debug('Step 2: Fallback fetched elderId:', elderId);
            // Save it correctly this time
            await SecureStore.setItemAsync('setup_elderId', elderId);
          }
        } catch (e) {
          Logger.error('Step 2: Fallback fetch failed:', e);
        }
      }

      if (!elderId || elderId === 'undefined' || elderId === 'null') {
        throw new Error('ไม่พบข้อมูลผู้สูงอายุ กรุณากลับไปทำขั้นตอนที่ 1 ใหม่');
      }

      Logger.info(`Step 2: Pairing device ${deviceCode} with elder ${elderId}`);
      return await pairDevice({ deviceCode, elderId });
    },
    onSuccess: async (device) => {
      isScanning.current = false; // ✅ Release lock after successful pairing
      await SecureStore.setItemAsync('setup_deviceId', String(device.id));
      await SecureStore.setItemAsync('setup_step', '3');
      Alert.alert(
        'เชื่อมต่ออุปกรณ์สำเร็จ',
        'เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => router.push('/(setup)/step3-wifi-setup') }]
      );
    },
    onError: (error: any) => {
      Logger.error('Error pairing device:', error);
      // Do NOT release lock immediately to prevent rapid re-scanning
      // isScanning.current = false; 

      const errorMessage = error.data?.error || error.message || JSON.stringify(error);
      const isAlreadyPaired = errorMessage.includes('already paired') ||
        errorMessage.includes('Device is already paired') ||
        (error.data && JSON.stringify(error.data).includes('already paired'));

      // If already paired, check if we can proceed
      if (isAlreadyPaired) {
        Alert.alert(
          'อุปกรณ์ถูกเชื่อมต่อแล้ว',
          'อุปกรณ์นี้ถูกเชื่อมต่อแล้ว คุณต้องการไปขั้นตอนถัดไปเลยหรือไม่?',
          [
            {
              text: 'ยกเลิก',
              style: 'cancel',
              onPress: () => {
                isScanning.current = false; // Release lock only on cancel
              }
            },
            {
              text: 'ไปขั้นตอนถัดไป',
              onPress: async () => {
                // Keep locked as we navigate away
                await SecureStore.setItemAsync('setup_step', '3');
                router.push('/(setup)/step3-wifi-setup');
              }
            }
          ]
        );
        return;
      }

      Alert.alert(
        'ข้อผิดพลาด',
        errorMessage || 'ไม่สามารถเชื่อมต่ออุปกรณ์ได้',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              isScanning.current = false; // Release lock on dismissal
            }
          }
        ]
      );
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle pairing actions
  // ==========================================
  const handleManualPairing = async () => {
    // Get clean 8 character device code
    const cleanCode = macAddress.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

    if (!cleanCode || cleanCode.length !== 8) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัสอุปกรณ์ 8 หลัก');
      return;
    }

    Logger.info('Manual pairing with device code:', cleanCode);
    // Manual pairing shouldn't be blocked by camera scanning lock
    // We rely on pairMutation.isPending for button disable state
    pairMutation.mutate(cleanCode);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Prevent multiple scans
    if (isScanning.current || pairMutation.isPending) return;
    isScanning.current = true;
    Logger.info('Scanned QR:', data);
    pairMutation.mutate(data);
  };

  // ==========================================
  // 🧩 LAYER: Logic (Navigation & State)
  // ==========================================
  const handleBack = async () => {
    if (showManualEntry) {
      setShowManualEntry(false);
      isScanning.current = false; // Reset lock when going back to camera
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


  // ==========================================
  // 📝 LAYER: View (Manual Entry Mode)
  // ==========================================
  if (showManualEntry) {
    return (
      <ScreenWrapper contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
        <ScreenHeader title="ติดตั้งอุปกรณ์" />

        <View>
          {/* Info Note */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-2">
            <Text className="font-kanit text-blue-600 font-medium" style={{ fontSize: 15 }}>
              กรุณากรอกรหัสอุปกรณ์ 8 หลัก
            </Text>
            <Text className="font-kanit text-blue-600" style={{ fontSize: 15, marginTop: 2 }}>
              ที่ติดบนสติ๊กเกอร์ของอุปกรณ์
            </Text>
            <Text className="font-kanit text-gray-500 mt-2" style={{ fontSize: 14 }}>
              ตัวอย่าง: 832CE051
            </Text>
          </View>

          {/* Chip Icon */}
          <View className="items-center my-8">
            <View className="w-28 h-28 rounded-full bg-[#16AD78]/10 items-center justify-center">
              <View className="w-16 h-16 rounded-xl border-2 border-[#16AD78] items-center justify-center">
                <View className="w-8 h-8 rounded-md bg-[#16AD78]/20 border border-[#16AD78]" />
                {/* Chip pins */}
                <View className="absolute -left-2 top-1/2 -translate-y-1/2 flex-col gap-1">
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                </View>
                <View className="absolute -right-2 top-1/2 -translate-y-1/2 flex-col gap-1">
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                  <View className="w-2 h-1 bg-[#16AD78] rounded-sm" />
                </View>
              </View>
            </View>
          </View>

          {/* Device Code Input */}
          <View className="mb-6">
            <FloatingLabelInput
              label="รหัสอุปกรณ์ (Device Code)"
              value={macAddress}
              onChangeText={(text) => setMacAddress(formatDeviceCode(text))}
              autoCapitalize="characters"
              maxLength={8}
              style={{ fontSize: 18, letterSpacing: 3 }}
            />
          </View>

          {/* Submit Button */}
          <PrimaryButton
            title="ยืนยัน"
            onPress={handleManualPairing}
            loading={pairMutation.isPending}
            disabled={macAddress.length !== 8}
            style={{ marginTop: 24, marginBottom: 16 }}
          />

          {/* Back to Camera Button */}
          <TouchableOpacity
            onPress={() => {
              setShowManualEntry(false);
              isScanning.current = false;
            }}
            className="py-3 items-center"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="photo-camera" size={20} color="#6B7280" />
              <Text className="font-kanit text-gray-500 ml-2">
                กลับไปสแกน QR Code
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScreenWrapper >
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
      <View className="flex-1" style={{ zIndex: 10 }} pointerEvents="box-none">

        <ScreenHeader title="ติดตั้งอุปกรณ์" onBack={handleBack} transparent />

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
              onPress={() => {
                isScanning.current = false; // Reset lock when entering manual mode
                setShowManualEntry(true);
              }}
              className="flex-row items-center bg-white/20 px-6 py-4 rounded-full border border-white/30 backdrop-blur-md shadow-lg active:bg-white/30"
            >
              <MaterialIcons name="dialpad" size={20} color="white" />
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
