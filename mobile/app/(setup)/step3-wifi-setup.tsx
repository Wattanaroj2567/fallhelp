import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { configureWifi } from '@/services/deviceService';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 3 of Setup - WiFi Configuration
// ==========================================
export default function Step3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage WiFi connection state
  // ==========================================
  const [manualSsid, setManualSsid] = useState('');
  const [manualPassword, setManualPassword] = useState('');



  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Configure WiFi for the device
  // ==========================================
  const configureWifiMutation = useMutation({
    mutationFn: async (payload: { ssid: string; wifiPassword: string }) => {
      const deviceId = await SecureStore.getItemAsync('setup_deviceId');
      if (!deviceId) throw new Error('ไม่พบข้อมูลอุปกรณ์ กรุณากลับไปทำขั้นตอนที่ 2 ใหม่');

      return await configureWifi(deviceId, payload);
    },
    onSuccess: async () => {
      // Clear all setup data
      await SecureStore.deleteItemAsync('setup_step');
      await SecureStore.deleteItemAsync('setup_elderId');
      await SecureStore.deleteItemAsync('setup_deviceId');
      await AsyncStorage.removeItem('setup_step1_form_data');

      router.replace('/(setup)/saved-success');
    },
    onError: (error: any) => {
      Logger.error('Error configuring WiFi:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเชื่อมต่อ WiFi ได้');
    },
  });

  const handleConnect = () => {
    if (!manualSsid.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อ WiFi (SSID)');
      return;
    }
    configureWifiMutation.mutate({ ssid: manualSsid, wifiPassword: manualPassword });
  };

  const handleBack = async () => {
    try {
      // Auto-Unpair: Undo Step 2 to allow clean re-pairing
      const deviceId = await SecureStore.getItemAsync('setup_deviceId');
      if (deviceId) {
        const { unpairDevice } = require('../../services/deviceService');
        await unpairDevice({ deviceId });
        await SecureStore.deleteItemAsync('setup_deviceId');
        Logger.info('Auto-unpaired device:', deviceId);
      }
    } catch (error) {
      Logger.error('Failed to auto-unpair:', error);
      // Proceed anyway to not block navigation
    }

    // Downgrade step to 2
    await SecureStore.setItemAsync('setup_step', '2');

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(setup)/step2-device-pairing');
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
      {/* Header & Progress Bar (Matched with Step 2) */}
      <ScreenHeader title="ตั้งค่า WiFi" onBack={handleBack} />

      {/* Progress Bar - Manually added for now as it's specific to setup flow */}
      <View className="mb-4">
        <View className="relative">
          {/* Connecting Line (Background) */}
          <View
            className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-gray-200"
            style={{ zIndex: 0 }}
          />
          <View
            className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-[#16AD78]"
            style={{ zIndex: 1 }}
          />

          {/* Steps (Foreground) */}
          <View className="flex-row justify-between">
            {/* Step 1 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-[#16AD78] items-center justify-center z-10 mb-2 shadow-sm border border-[#16AD78]">
                <MaterialIcons name="check" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12 }} className="text-green-600 text-center font-kanit">
                กรอกข้อมูล{'\n'}ผู้สูงอายุ
              </Text>
            </View>

            {/* Step 2 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-[#16AD78] items-center justify-center z-10 mb-2 shadow-sm border border-[#16AD78]">
                <MaterialIcons name="check" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12 }} className="text-green-600 text-center font-kanit">
                ติดตั้งอุปกรณ์
              </Text>
            </View>

            {/* Step 3 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center z-10 mb-2 shadow-sm border border-blue-600">
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-white font-kanit">3</Text>
              </View>
              <Text style={{ fontSize: 12 }} className="text-blue-600 text-center font-kanit">
                ตั้งค่า WiFi
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        {/* Title */}
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900 mb-2 mt-4">
          ตั้งค่าเครือข่าย WiFi สำหรับอุปกรณ์
        </Text>
        <Text style={{ fontSize: 14 }} className="font-kanit text-gray-600 mb-6">
          กรุณากรอกชื่อ WiFi (SSID) และรหัสผ่านเพื่อเชื่อมต่ออุปกรณ์กับอินเทอร์เน็ต
        </Text>

        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
            รองรับเฉพาะ WiFi 2.4GHz เท่านั้น
          </Text>
        </View>

        <View className="mb-4">
          <FloatingLabelInput
            label="ชื่อ WiFi (SSID)"
            value={manualSsid}
            onChangeText={setManualSsid}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <FloatingLabelInput
            label="รหัสผ่าน WiFi"
            value={manualPassword}
            onChangeText={setManualPassword}
            isPassword
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        <PrimaryButton
          title="เชื่อมต่อ"
          onPress={handleConnect}
          loading={configureWifiMutation.isPending}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Modal visible={configureWifiMutation.isPending} transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 items-center">
            <ActivityIndicator size="large" color="#16AD78" />
            <Text style={{ fontSize: 16 }} className="text-gray-900 mt-4 font-kanit">
              กำลังเชื่อมต่อ WiFi กับอุปกรณ์...
            </Text>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
