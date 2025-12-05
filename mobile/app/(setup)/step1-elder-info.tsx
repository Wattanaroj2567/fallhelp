import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { createElder, updateElder, deleteElder, CreateElderPayload } from '@/services/elderService';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import DateTimePicker from '@react-native-community/datetimepicker';

const FORM_STORAGE_KEY = 'setup_step1_form_data';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 1 of Setup - Elder Information
// ==========================================
export default function Step1() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputLayouts = useRef<{ [key: string]: number }>({});

  const scrollToInput = (key: string) => {
    const y = inputLayouts.current[key];
    if (y !== undefined) {
      // Scroll to position with some offset (e.g. 20px) to show context above
      scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
    }
  };

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [address, setAddress] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // ==========================================
  // 💾 LAYER: Logic (Persistence)
  // Purpose: Save and load form data
  // ==========================================
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Check if we already have an elderId saved (means we're returning from step2)
        let existingElderId = await SecureStore.getItemAsync('setup_elderId');
        if (existingElderId === 'undefined' || existingElderId === 'null') {
          existingElderId = null;
        }
        Logger.debug('Step 1 loadFormData: existingElderId =', existingElderId);

        const savedData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setName(parsed.name || '');
          setGender(parsed.gender || '');
          setDateOfBirth(parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null);
          setHeight(parsed.height || '');
          setWeight(parsed.weight || '');
          setMedicalCondition(parsed.medicalCondition || '');
          setAddress(parsed.address || '');

          // Only set initialData if we have a valid elderId
          // This ensures we update instead of create when going back from step2
          if (existingElderId) {
            setInitialData(parsed);
            Logger.debug('Step 1: Set initialData for existing elder');
          } else {
            // No elderId means this is a fresh start, don't set initialData
            // to force create on first submit
            Logger.debug('Step 1: No elderId, will create new elder');
          }
        }
      } catch (error) {
        Logger.error('Failed to load form data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFormData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saveFormData = async () => {
      try {
        const dataToSave = {
          name,
          gender,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
          height,
          weight,
          medicalCondition,
          address,
        };
        await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        Logger.error('Failed to save form data:', error);
      }
    };
    // Debounce saving slightly to avoid excessive writes
    const timeoutId = setTimeout(saveFormData, 500);
    return () => clearTimeout(timeoutId);
  }, [name, gender, dateOfBirth, height, weight, medicalCondition, address, isLoaded]);



  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Create or Update elder profile
  // ==========================================
  const saveElderMutation = useMutation({
    mutationFn: async (data: CreateElderPayload) => {
      let existingElderId = await SecureStore.getItemAsync('setup_elderId');

      // Check for invalid values stored as strings
      if (existingElderId === 'undefined' || existingElderId === 'null') {
        existingElderId = null;
        // Clean up invalid data
        await SecureStore.deleteItemAsync('setup_elderId');
      }

      if (existingElderId) {
        // Update existing elder
        Logger.info('Updating existing elder:', existingElderId);
        return await updateElder(existingElderId, data);
      } else {
        // Create new elder
        Logger.info('Creating new elder');
        return await createElder(data);
      }
    },
    onSuccess: async (elder) => {
      // 1. Save Elder ID (if not already saved)
      await SecureStore.setItemAsync('setup_elderId', String(elder.id));

      // 2. Set Setup Step to 2
      await SecureStore.setItemAsync('setup_step', '2');

      // Navigate to Step 2
      router.push('/(setup)/step2-device-pairing');
    },
    onError: (error: any) => {
      Logger.error('Error saving elder:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Validate and submit form
  // ==========================================
  const handleNext = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อผู้สูงอายุ');
      return;
    }
    if (!gender) {
      Alert.alert('กรุณาเลือกข้อมูล', 'กรุณาเลือกเพศ');
      return;
    }
    if (!dateOfBirth) {
      Alert.alert('กรุณาเลือกข้อมูล', 'กรุณาระบุวันเกิด');
      return;
    }

    // Validate Age (Must be 55+)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 55) {
      Alert.alert('อายุไม่ถึงเกณฑ์', 'ผู้สูงอายุต้องมีอายุ 55 ปีขึ้นไป กรุณาตรวจสอบปีเกิดอีกครั้ง');
      return;
    }

    // Validate Height (Required)
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกส่วนสูงให้ถูกต้อง');
      return;
    }

    // Validate Weight (Required)
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกน้ำหนักให้ถูกต้อง');
      return;
    }

    // Validate Address (Required)
    if (!address.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกที่อยู่');
      return;
    }

    const currentData = {
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER',
      dateOfBirth: dateOfBirth.toISOString(),
      height: Number(height),
      weight: Number(weight),
      diseases: medicalCondition ? [medicalCondition.trim()] : [],
      notes: address.trim(),
    };

    // Check if data is unchanged and we have an existing elderId
    const existingElderId = await SecureStore.getItemAsync('setup_elderId');
    if (existingElderId && existingElderId !== 'undefined' && existingElderId !== 'null' && initialData) {
      // Reconstruct initial data to match currentData structure for comparison
      const initialDataFormatted = {
        firstName: initialData.name?.split(' ')[0] || initialData.name,
        lastName: initialData.name?.split(' ').slice(1).join(' ') || '',
        gender: initialData.gender,
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString() : null,
        height: Number(initialData.height),
        weight: Number(initialData.weight),
        diseases: initialData.medicalCondition ? [initialData.medicalCondition.trim()] : [],
        notes: initialData.address?.trim(),
      };

      if (JSON.stringify(currentData) === JSON.stringify(initialDataFormatted)) {
        Logger.debug('Data unchanged, skipping update');
        await SecureStore.setItemAsync('setup_step', '2');
        router.push('/(setup)/step2-device-pairing');
        return;
      }
    }

    saveElderMutation.mutate(currentData);
  };

  const handleBack = async () => {
    try {
      // Auto-Delete Elder: Undo Step 1 if user goes back to empty state
      const elderId = await SecureStore.getItemAsync('setup_elderId');
      if (elderId) {
        await deleteElder(elderId);
        await SecureStore.deleteItemAsync('setup_elderId');
        await AsyncStorage.removeItem(FORM_STORAGE_KEY);
        Logger.info('Auto-deleted elder on back to empty state:', elderId);
      }
    } catch (error) {
      Logger.error('Failed to auto-delete elder:', error);
    }
    router.replace('/(setup)/empty-state');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth || new Date();
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDateOfBirth(currentDate);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'วัน/เดือน/ปีเกิด';
    const day = date.getDate();
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const GenderPickerModal = () => (
    <Modal
      transparent={true}
      visible={showGenderPicker}
      animationType="fade"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={() => setShowGenderPicker(false)}
      >
        <View className="bg-white w-full rounded-2xl p-4">
          <Text className="font-kanit text-lg font-bold mb-4 text-center">เลือกเพศ</Text>
          {['ชาย', 'หญิง', 'อื่นๆ'].map((optionLabel) => {
            const value = optionLabel === 'ชาย' ? 'MALE' : optionLabel === 'หญิง' ? 'FEMALE' : 'OTHER';
            return (
              <TouchableOpacity
                key={value}
                className="py-4 border-b border-gray-100"
                onPress={() => {
                  setGender(value);
                  setShowGenderPicker(false);
                }}
              >
                <Text className={`font-kanit text-center text-base ${gender === value ? 'text-[#16AD78] font-bold' : 'text-gray-700'}`}>
                  {optionLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16AD78" />
      </View>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      keyboardAvoiding
      edges={['top', 'left', 'right']}
    >
      {/* Header - Matched Register Screen */}
      <ScreenHeader title="ข้อมูลผู้สูงอายุ" onBack={handleBack} />

      {/* Progress Bar */}
      <View className="px-6 pb-4 mb-4">
        <View className="relative">
          {/* Connecting Line (Background) */}
          <View
            className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-gray-200"
            style={{ zIndex: 0 }}
          />
          {/* Active Line (None for Step 1 start) */}

          {/* Steps (Foreground) */}
          <View className="flex-row justify-between">
            {/* Step 1 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center z-10 mb-2 shadow-sm border border-blue-400">
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-white font-kanit">1</Text>
              </View>
              <Text style={{ fontSize: 12 }} className="text-blue-600 text-center font-kanit">
                กรอกข้อมูล{'\n'}ผู้สูงอายุ
              </Text>
            </View>

            {/* Step 2 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 items-center justify-center z-10 mb-2">
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-gray-400 font-kanit">2</Text>
              </View>
              <Text style={{ fontSize: 12 }} className="text-gray-400 text-center font-kanit">
                ติดตั้งอุปกรณ์
              </Text>
            </View>

            {/* Step 3 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 items-center justify-center z-10 mb-2">
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-gray-400 font-kanit">3</Text>
              </View>
              <Text style={{ fontSize: 12 }} className="text-gray-400 text-center font-kanit">
                ตั้งค่า WiFi
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 flex-1">
        {/* Info Note */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-6">
          <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
            เพื่อให้เป็นข้อมูลส่วนตัวของคุณในการติดตามผู้สูงอายุและเพิ่มเติม
          </Text>
        </View>

        {/* Elder Name */}
        <View
          className="mb-4"
          onLayout={(event) => {
            inputLayouts.current['name'] = event.nativeEvent.layout.y;
          }}
        >
          <FloatingLabelInput
            label="ชื่อผู้สูงอายุ *"
            value={name}
            onChangeText={setName}
            onFocus={() => scrollToInput('name')}
          />
        </View>

        {/* Gender */}
        <View className="mb-4">
          <View style={{ height: 60 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowGenderPicker(true)}
              className="h-full justify-center rounded-2xl border border-gray-200 px-4 bg-white relative"
            >
              {gender ? (
                <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                  <Text className="font-kanit" style={{ fontSize: 12, color: '#9CA3AF' }}>
                    เพศ <Text className="text-red-500">*</Text>
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center">
                <Text
                  className={`font-kanit text-[16px] ${gender ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {gender === 'MALE' ? 'ชาย' : gender === 'FEMALE' ? 'หญิง' : gender === 'OTHER' ? 'อื่นๆ' : 'เพศ *'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birth Date */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-2xl px-4 border border-gray-200 justify-center"
            style={{ height: 60 }}
          >
            {dateOfBirth ? (
              <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                <Text className="font-kanit" style={{ fontSize: 12, color: '#9CA3AF' }}>
                  วัน/เดือน/ปีเกิด <Text className="text-red-500">*</Text>
                </Text>
              </View>
            ) : null}
            <Text className={`font-kanit text-[16px] ${dateOfBirth ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatDate(dateOfBirth)}
              {!dateOfBirth && ' *'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height and Weight */}
        <View
          className="flex-row mb-4"
          onLayout={(event) => {
            inputLayouts.current['height_weight'] = event.nativeEvent.layout.y;
          }}
        >
          <View className="flex-1 mr-2">
            <FloatingLabelInput
              label="ส่วนสูง (cm) *"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              onFocus={() => scrollToInput('height_weight')}
            />
          </View>
          <View className="flex-1 ml-2">
            <FloatingLabelInput
              label="น้ำหนัก (kg) *"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              onFocus={() => scrollToInput('height_weight')}
            />
          </View>
        </View>

        {/* Medical Condition */}
        <View
          className="mb-4"
          onLayout={(event) => {
            inputLayouts.current['medical'] = event.nativeEvent.layout.y;
          }}
        >
          <FloatingLabelInput
            label="โรคประจำตัว หรือ เคยป่วย (ถ้ามี)"
            value={medicalCondition}
            onChangeText={setMedicalCondition}
            multiline
            numberOfLines={3}
            onFocus={() => scrollToInput('medical')}
            style={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 18 }}
            containerStyle={{ minHeight: 100 }}
          />
        </View>

        {/* Address */}
        <View
          className="mb-6"
          onLayout={(event) => {
            inputLayouts.current['address'] = event.nativeEvent.layout.y;
          }}
        >
          <FloatingLabelInput
            label="ที่อยู่ *"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={4}
            onFocus={() => scrollToInput('address')}
            style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: 18 }}
            containerStyle={{ minHeight: 120 }}
          />
        </View>

        {/* Next Button */}
        <PrimaryButton
          title="ถัดไป"
          onPress={handleNext}
          loading={saveElderMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>
      <GenderPickerModal />

      {/* Date Picker Modal (iOS) or standard (Android) */}
      {Platform.OS === 'ios' ? (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              className="bg-white pb-6 rounded-t-3xl"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <Text className="font-kanit text-lg font-bold">เลือกวันเกิด</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="font-kanit text-blue-600 text-lg font-bold">เสร็จสิ้น</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateOfBirth || new Date()}
                maximumDate={new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                locale="th-TH"
                textColor="#000000"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            maximumDate={new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </ScreenWrapper>
  );
}
