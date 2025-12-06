import React, { useState, useRef, useEffect } from 'react';
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
  Pressable,
  Keyboard
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { register } from '@/services/authService';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

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
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false); // Default to fixed

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Toggle scroll based on keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsScrollEnabled(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsScrollEnabled(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
      // Redirect to success screen
      router.replace({
        pathname: '/(auth)/success',
        params: { type: 'register' }
      });
    },
    onError: (error: any) => {
      Logger.error('Register error:', error);
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

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render registration form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: false, // iOS: ห้ามเด้งดึ๋ง
        overScrollMode: 'never', // Android: ห้ามเด้งแสง
        scrollEnabled: isScrollEnabled, // ✅ Only scroll when keyboard is open
      }}
      scrollViewRef={scrollViewRef} // Pass ref correctly
      header={<ScreenHeader title="ลงทะเบียน" onBack={router.back} />}
    >
      <View>
        <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, textAlign: 'left' }}>
          กรุณากรอกรายละเอียดของคุณเพื่อเข้าใช้งาน
        </Text>

        <View className="w-full">

          {/* Row 1: Name & Lastname */}
          <View className="flex-row gap-3 mb-2">
            {/* First Name */}
            <FloatingLabelInput
              label="ชื่อ"
              value={firstName}
              onChangeText={setFirstName}
              containerStyle={{ flex: 1 }}
            />

            {/* Last Name */}
            <FloatingLabelInput
              label="นามสกุล"
              value={lastName}
              onChangeText={setLastName}
              containerStyle={{ flex: 1 }}
            />
          </View>

          {/* Row 2: Gender */}
          {/* Row 2: Gender */}
          <View className="mb-0 relative">
            <View pointerEvents="none">
              <FloatingLabelInput
                label="เพศ"
                value={gender === 'MALE' ? 'ชาย' : gender === 'FEMALE' ? 'หญิง' : gender === 'OTHER' ? 'อื่นๆ' : ''}
                editable={false}
                right={
                  <PaperTextInput.Icon
                    icon="chevron-down"
                    color="#6B7280"
                    forceTextInputFocus={false}
                  />
                }
              />
            </View>
            <Pressable
              onPress={() => setShowGenderPicker(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10
              }}
            />
          </View>

          {/* Row 3: Phone */}
          <FloatingLabelInput
            label="เบอร์โทรศัพท์"
            value={phone}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 10) {
                setPhone(cleaned);
              }
            }}
            keyboardType="number-pad"
            maxLength={10}
          />
          {/* Row 4: Email */}
          <FloatingLabelInput
            label="อีเมล"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (/[ก-๙]/.test(text)) {
                setEmailError('กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
              } else {
                setEmailError('');
              }
            }}
            error={emailError}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="email-address"
          />

          {/* Row 5: Password */}
          <FloatingLabelInput
            label="รหัสผ่าน"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (/[ก-๙]/.test(text)) {
                setPasswordError('กรุณากรอกรหัสผ่านเป็นภาษาอังกฤษ');
              } else {
                setPasswordError('');
              }
            }}
            error={passwordError}
            isPassword
            autoCapitalize="none"
            textContentType="password"
          />

          {/* Requirements */}
          {/* Requirements */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-8">
            <Text style={{ fontSize: 12, fontWeight: '600' }} className="font-kanit text-blue-700 mb-2">
              ข้อกำหนดรหัสผ่าน:
            </Text>
            <View className="flex-row items-start mb-1">
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 mr-2">•</Text>
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1">
                อย่างน้อย 8 ตัวอักษร
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 mr-2">•</Text>
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1">
                มีตัวอักษรพิมพ์ใหญ่-เล็กและตัวเลข
              </Text>
            </View>
          </View>

          {/* Register Button */}
          <PrimaryButton
            title="ลงทะเบียน"
            onPress={handleRegister}
            loading={registerMutation.isPending}
          />

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

      {/* Gender Picker Modal */}
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

      {/* Date Picker (if any) would go here */}
    </ScreenWrapper>
  );
}
