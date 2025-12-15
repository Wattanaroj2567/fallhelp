import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Logger from '@/utils/logger';
import { WizardLayout } from '@/components/WizardLayout';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 3 of Setup - WiFi Configuration (Captive Portal)
// ==========================================
export default function Step3() {
  const router = useRouter();

  // Current step in the Captive Portal flow
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, _setIsLoading] = useState(false);

  // Open WiFi Settings - Show instructions
  const handleOpenWifiSettings = () => {
    Alert.alert(
      'วิธีตั้งค่า WiFi อุปกรณ์',
      '1. ปัดจอลงมาจากมุมขวาบน\n\n' +
        '2. กดค้างที่ไอคอน WiFi\n\n' +
        '3. เลือก "FallHelp-DAF380"\n\n' +
        '4. หน้าตั้งค่าจะเปิดอัตโนมัติ\n\n' +
        '5. กรอกข้อมูล WiFi แล้วกลับมากดขั้นตอนถัดไป',
      [{ text: 'เข้าใจแล้ว', onPress: () => setCurrentStep(2) }],
    );
  };

  // Complete setup
  const handleComplete = async () => {
    try {
      // Clear all setup data
      await SecureStore.deleteItemAsync('setup_step');
      await SecureStore.deleteItemAsync('setup_elderId');
      await SecureStore.deleteItemAsync('setup_deviceId');
      await AsyncStorage.removeItem('setup_step1_form_data');

      router.replace('/(setup)/saved-success');
    } catch (err) {
      Logger.error('Error clearing setup data:', err);
      router.replace('/(setup)/saved-success');
    }
  };

  const handleBack = async () => {
    await SecureStore.setItemAsync('setup_step', '2');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(setup)/step2-device-pairing');
    }
  };

  // Step Card Component
  const StepCard = ({
    step,
    title,
    description,
    buttonTitle,
    buttonIcon,
    onPress,
    isActive,
    isCompleted,
  }: {
    step: number;
    title: string;
    description: string;
    buttonTitle: string;
    buttonIcon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    isActive: boolean;
    isCompleted: boolean;
  }) => (
    <View
      className={`rounded-2xl p-4 mb-4 border-2 ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : isActive
            ? 'bg-white border-[#16AD78]'
            : 'bg-gray-50 border-gray-200'
      }`}
    >
      <View className="flex-row items-center mb-3">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            isCompleted ? 'bg-green-500' : isActive ? 'bg-[#16AD78]' : 'bg-gray-300'
          }`}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="white" />
          ) : (
            <Text className="text-white font-bold">{step}</Text>
          )}
        </View>
        <Text
          className={`font-kanit font-semibold text-base ${
            isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {title}
        </Text>
      </View>

      <Text
        className={`font-kanit text-sm mb-4 ${
          isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        {description}
      </Text>

      {isActive && !isCompleted && (
        <TouchableOpacity
          onPress={onPress}
          className="bg-[#16AD78] rounded-xl py-3 flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name={buttonIcon} size={20} color="white" />
          <Text className="font-kanit font-semibold text-white ml-2">{buttonTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <WizardLayout
      currentStep={3}
      title="ตั้งค่า WiFi"
      onBack={handleBack}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
    >
      <View className="flex-1 mt-2">
        {/* Header */}
        <Text className="font-kanit font-bold text-gray-900 mb-2" style={{ fontSize: 20 }}>
          ตั้งค่า WiFi สำหรับอุปกรณ์
        </Text>
        <Text className="font-kanit text-gray-500 text-sm mb-6">
          ทำตามขั้นตอนด้านล่างเพื่อเชื่อมต่ออุปกรณ์กับ WiFi
        </Text>

        {/* Step 1: Connect to WiFi */}
        <StepCard
          step={1}
          title="เชื่อมต่อ WiFi อุปกรณ์"
          description="กดปุ่มด้านล่างเพื่อดูวิธีการเชื่อมต่อ"
          buttonTitle="ดูวิธีเชื่อมต่อ"
          buttonIcon="help-circle"
          onPress={handleOpenWifiSettings}
          isActive={currentStep >= 1}
          isCompleted={currentStep > 1}
        />

        {/* Step 2: Complete */}
        <StepCard
          step={2}
          title="เสร็จสิ้น"
          description="ตั้งค่า WiFi เสร็จแล้ว กดปุ่มด้านล่างเพื่อดำเนินการต่อ"
          buttonTitle="ดำเนินการต่อ"
          buttonIcon="checkmark-circle"
          onPress={handleComplete}
          isActive={currentStep >= 2}
          isCompleted={false}
        />
      </View>

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 items-center">
            <ActivityIndicator size="large" color="#16AD78" />
            <Text style={{ fontSize: 16 }} className="text-gray-900 mt-4 font-kanit">
              กำลังเปิดหน้าตั้งค่า...
            </Text>
          </View>
        </View>
      </Modal>
    </WizardLayout>
  );
}
