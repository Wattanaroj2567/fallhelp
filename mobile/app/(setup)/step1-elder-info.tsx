import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { createElder, CreateElderPayload } from '@/services/elderService';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
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

  // Focus State
  const [nameFocused, setNameFocused] = useState(false);
  const [heightFocused, setHeightFocused] = useState(false);
  const [weightFocused, setWeightFocused] = useState(false);
  const [medicalFocused, setMedicalFocused] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);

  // ==========================================
  // 💾 LAYER: Logic (Persistence)
  // Purpose: Save and load form data
  // ==========================================
  useEffect(() => {
    const loadFormData = async () => {
      try {
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
        }
      } catch (error) {
        console.log('Failed to load form data:', error);
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
        console.log('Failed to save form data:', error);
      }
    };
    // Debounce saving slightly to avoid excessive writes
    const timeoutId = setTimeout(saveFormData, 500);
    return () => clearTimeout(timeoutId);
  }, [name, gender, dateOfBirth, height, weight, medicalCondition, address, isLoaded]);

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

  const nameAnim = useInputAnimation(nameFocused, name);
  const heightAnim = useInputAnimation(heightFocused, height);
  const weightAnim = useInputAnimation(weightFocused, weight);
  const medicalAnim = useInputAnimation(medicalFocused, medicalCondition);
  const addressAnim = useInputAnimation(addressFocused, address);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Create new elder profile
  // ==========================================
  const createElderMutation = useMutation({
    mutationFn: async (data: CreateElderPayload) => {
      return await createElder(data);
    },
    onSuccess: async (elder) => {
      // 1. Save Elder ID
      await SecureStore.setItemAsync('setup_elderId', String(elder.id));
      // 2. Clear Form Data - COMMENTED OUT to allow back navigation with data
      // await AsyncStorage.removeItem(FORM_STORAGE_KEY);
      // 3. Set Setup Step to 2
      await SecureStore.setItemAsync('setup_step', '2');

      router.push('/(setup)/step2-device-pairing');
    },
    onError: (error: any) => {
      console.error('Error creating elder:', error);
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

    createElderMutation.mutate({
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER',
      dateOfBirth: dateOfBirth.toISOString(),
      height: Number(height),
      weight: Number(weight),
      diseases: medicalCondition ? [medicalCondition.trim()] : [],
      notes: address.trim(),
    });
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header - Matched Register Screen */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.replace('/(setup)/empty-state')} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="font-kanit text-xl font-bold text-gray-900">
          ข้อมูลผู้สูงอายุ
        </Text>
        <View className="w-8" />
      </View>

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

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
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
            <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
              <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, nameAnim.containerStyle]}>
                <Animated.Text className="font-kanit" style={[nameAnim.textStyle]}>
                  ชื่อผู้สูงอายุ <Text className="text-red-500">*</Text>
                </Animated.Text>
              </Animated.View>
              <TextInput
                className={`font-kanit h-[60px] rounded-2xl px-4 border ${nameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                style={{
                  fontFamily: 'Kanit',
                  height: 60,
                  paddingTop: 18,
                  paddingBottom: 18,
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                onFocus={() => {
                  setNameFocused(true);
                  scrollToInput('name');
                }}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Gender */}
          <View className="mb-4">
            <View style={{ height: INPUT_HEIGHT }}>
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
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
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
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, heightAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[heightAnim.textStyle]}>
                    ส่วนสูง (cm) <Text className="text-red-500">*</Text>
                  </Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${heightFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  onFocus={() => {
                    setHeightFocused(true);
                    scrollToInput('height_weight');
                  }}
                  onBlur={() => setHeightFocused(false)}
                />
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, weightAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[weightAnim.textStyle]}>
                    น้ำหนัก (kg) <Text className="text-red-500">*</Text>
                  </Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${weightFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  onFocus={() => {
                    setWeightFocused(true);
                    scrollToInput('height_weight');
                  }}
                  onBlur={() => setWeightFocused(false)}
                />
              </View>
            </View>
          </View>

          {/* Medical Condition */}
          <View
            className="mb-4"
            onLayout={(event) => {
              inputLayouts.current['medical'] = event.nativeEvent.layout.y;
            }}
          >
            <View style={{ minHeight: 100, position: 'relative' }}>
              <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, medicalAnim.containerStyle]}>
                <Animated.Text className="font-kanit" style={[medicalAnim.textStyle]}>โรคประจำตัว หรือ เคยป่วย (ถ้ามี)</Animated.Text>
              </Animated.View>
              <TextInput
                className={`font-kanit rounded-2xl px-4 py-3 border ${medicalFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                style={{
                  fontFamily: 'Kanit',
                  minHeight: 100,
                  paddingTop: 18,
                  paddingBottom: 18,
                  textAlignVertical: 'top',
                  includeFontPadding: false,
                }}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={medicalCondition}
                onChangeText={setMedicalCondition}
                onFocus={() => {
                  setMedicalFocused(true);
                  scrollToInput('medical');
                }}
                onBlur={() => setMedicalFocused(false)}
              />
            </View>
          </View>

          {/* Address */}
          <View
            className="mb-6"
            onLayout={(event) => {
              inputLayouts.current['address'] = event.nativeEvent.layout.y;
            }}
          >
            <View style={{ minHeight: 120, position: 'relative' }}>
              <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, addressAnim.containerStyle]}>
                <Animated.Text className="font-kanit" style={[addressAnim.textStyle]}>
                  ที่อยู่ <Text className="text-red-500">*</Text>
                </Animated.Text>
              </Animated.View>
              <TextInput
                className={`font-kanit rounded-2xl px-4 py-3 border ${addressFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                style={{
                  fontFamily: 'Kanit',
                  minHeight: 120,
                  paddingTop: 18,
                  paddingBottom: 18,
                  textAlignVertical: 'top',
                  includeFontPadding: false,
                }}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={address}
                onChangeText={setAddress}
                onFocus={() => {
                  setAddressFocused(true);
                  scrollToInput('address');
                }}
                onBlur={() => setAddressFocused(false)}
              />
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={createElderMutation.isPending}
            className="bg-[#16AD78] rounded-2xl py-4 items-center mb-8"
            style={{ opacity: createElderMutation.isPending ? 0.6 : 1 }}
            activeOpacity={0.8}
          >
            {createElderMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                ถัดไป
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    </SafeAreaView>
  );
}
