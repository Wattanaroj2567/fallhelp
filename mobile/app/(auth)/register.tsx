import React, { useState, useRef } from 'react';
import {
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Alert,
  Modal,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { register } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

// ปรับความสูงกลับเป็น 60 เพื่อความสวยงามและกดง่าย
const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
const PASSWORD_ICON_SIZE = 22;

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Registration Screen
// ==========================================
export default function RegisterScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Focus States
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper for Label Animation
  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================
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

  const firstNameAnim = useInputAnimation(firstNameFocused, firstName);
  const lastNameAnim = useInputAnimation(lastNameFocused, lastName);
  const phoneAnim = useInputAnimation(phoneFocused, phone);
  const emailAnim = useInputAnimation(emailFocused, email);
  const passwordAnim = useInputAnimation(passwordFocused, password);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle registration API call
  // ==========================================
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await register(data);
    },
    onSuccess: () => {
      // Redirect logic
      setTimeout(() => {
        try {
          router.replace('/(setup)/empty-state');
        } catch (navError) {
          console.log('Navigation handled by _layout');
        }
      }, 100);
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      const message = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
      Alert.alert('ลงทะเบียนล้มเหลว', message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !gender) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกข้อมูลให้ครบถ้วน รวมถึงเพศ');
      return;
    }
    if (emailError) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
      return;
    }
    if (password.length < 8) {
      Alert.alert('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (phone && !/^0\d{9}$/.test(cleanedPhone)) {
      Alert.alert('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรอกเฉพาะตัวเลข 10 หลักและขึ้นต้นด้วย 0');
      return;
    }

    registerMutation.mutate({
      email,
      password,
      firstName,
      lastName,
      phone: cleanedPhone || undefined
    });
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
          {['ชาย', 'หญิง', 'อื่นๆ'].map((option) => (
            <TouchableOpacity
              key={option}
              className="py-4 border-b border-gray-100"
              onPress={() => {
                setGender(option);
                setShowGenderPicker(false);
              }}
            >
              <Text className={`font-kanit text-center text-base ${gender === option ? 'text-[#16AD78] font-bold' : 'text-gray-700'}`}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render registration form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="font-kanit text-xl font-bold text-gray-900">
          ลงทะเบียน
        </Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, textAlign: 'left' }}>
              กรุณากรอกรายละเอียดของคุณเพื่อเข้าใช้งาน
            </Text>

            <View className="w-full">

              {/* Row 1: Name & Lastname */}
              <View className="flex-row gap-3 mb-5">
                {/* First Name */}
                <View className="flex-1" style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 12 }, firstNameAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[firstNameAnim.textStyle]}>ชื่อ</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-full rounded-2xl px-4 border ${firstNameFocused ? 'border-[#16AD78]' : 'border-gray-300'} bg-white text-[16px]`}
                    style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center' }}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                  />
                </View>

                {/* Last Name */}
                <View className="flex-1" style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 12 }, lastNameAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[lastNameAnim.textStyle]}>นามสกุล</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-full rounded-2xl px-4 border ${lastNameFocused ? 'border-[#16AD78]' : 'border-gray-300'} bg-white text-[16px]`}
                    style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center' }}
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                  />
                </View>
              </View>

              {/* Row 2: Gender (Dropdown Style) */}
              <View className="mb-5" style={{ height: INPUT_HEIGHT }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowGenderPicker(true)}
                  className="h-full justify-center rounded-2xl border border-gray-300 px-4 bg-white relative"
                >
                  {gender ? (
                    <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                      <Text className="font-kanit" style={{ fontSize: 12, color: '#9CA3AF' }}>เพศ</Text>
                    </View>
                  ) : null}

                  <View className="flex-row justify-between items-center">
                    <Text
                      className={`font-kanit text-[16px] ${gender ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {gender || 'เพศ'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Row 3: Phone */}
              <View className="mb-5" style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 12 }, phoneAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[phoneAnim.textStyle]}>เบอร์โทรศัพท์</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-full rounded-2xl px-4 border ${phoneFocused ? 'border-[#16AD78]' : 'border-gray-300'} bg-white text-[16px]`}
                  style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center' }}
                  value={phone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 10) {
                      setPhone(cleaned);
                    }
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              {/* Row 4: Email */}
              <View className="mb-5">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 12 }, emailAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[emailAnim.textStyle]}>อีเมล</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-full rounded-2xl px-4 border ${emailFocused ? 'border-[#16AD78]' : emailError ? 'border-red-500' : 'border-gray-300'} bg-white text-[16px]`}
                    style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center' }}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (/[ก-๙]/.test(text)) {
                        setEmailError('กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
                      } else {
                        setEmailError('');
                      }
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? (
                  <Text className="font-kanit text-red-500 text-xs mt-1 ml-2">{emailError}</Text>
                ) : null}
              </View>

              {/* Row 5: Password */}
              <View className="mb-2">
                <View
                  style={{ height: INPUT_HEIGHT, position: 'relative' }}
                  className={`rounded-2xl px-4 border ${passwordFocused ? 'border-[#16AD78]' : passwordError ? 'border-red-500' : 'border-gray-300'} bg-white justify-center`}
                >
                  <Animated.View style={[{ position: 'absolute', left: 12, paddingHorizontal: 4, zIndex: 1 }, passwordAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[passwordAnim.textStyle]}>รหัสผ่าน</Animated.Text>
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
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (/[ก-๙]/.test(text)) {
                        setPasswordError('กรุณากรอกรหัสผ่านเป็นภาษาอังกฤษ');
                      } else {
                        setPasswordError('');
                      }
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    className="absolute right-4"
                    style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={PASSWORD_ICON_SIZE}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text className="font-kanit text-red-500 text-xs mt-1 ml-2">{passwordError}</Text>
                ) : null}
              </View>

              {/* Requirements */}
              <View className="mb-8 ml-2">
                <Text className="font-kanit" style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>
                  • อย่างน้อย 8 ตัวอักษร
                </Text>
                <Text className="font-kanit" style={{ fontSize: 12, color: '#6B7280' }}>
                  • มีตัวอักษรพิมพ์ใหญ่-เล็กและตัวเลข
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className={`bg-[#16AD78] rounded-2xl py-4 items-center shadow-sm ${registerMutation.isPending ? 'opacity-70' : ''}`}
                onPress={handleRegister}
                disabled={registerMutation.isPending}
                activeOpacity={0.85}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-kanit" style={{ fontSize: 17, color: '#FFFFFF', fontWeight: '600' }}>
                    ลงทะเบียน
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text className="font-kanit" style={{ fontSize: 15, color: '#6B7280' }}>มีบัญชีอยู่แล้ว ? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.7}
                >
                  <Text className="font-kanit" style={{ fontSize: 15, color: '#EB6A6A', fontWeight: '600' }}>
                    เข้าสู่ระบบ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenderPickerModal />
    </SafeAreaView>
  );
}
