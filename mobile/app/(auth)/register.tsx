import React, { useState, useRef } from 'react';
import { TouchableOpacity, ScrollView, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { register } from '@/services/authService';
import { showErrorMessage } from '@/utils/errorHelper';
import Logger from '@/utils/logger';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { GenderSelect } from '@/components/GenderSelect';
import { useAuth } from '@/context/AuthContext';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

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
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const _auth = useAuth(); // Auth context available if needed

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle registration API call
  // ==========================================

  const registerMutation = useMutation({
    mutationFn: async (data: unknown) => {
      // Type assertion: trust that form validation ensures correct structure
      return await register(data as Parameters<typeof register>[0]);
    },
    onSuccess: async (data) => {
      // Don't sign in immediately to avoid race condition with ProtectedRoute
      // Pass token to Success screen instead

      // Redirect to success screen
      router.replace({
        pathname: '/(auth)/success',
        params: {
          type: 'register',
          token: data.token, // Pass token for manual sign-in later
        },
      });
    },
    onError: (error: unknown) => {
      showErrorMessage('ลงทะเบียนล้มเหลว', error);
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

    const payload = {
      email,
      password,
      firstName,
      lastName,
      gender,
      phone: cleanedPhone || undefined,
    };

    Logger.info('Sending registration payload:', payload);
    registerMutation.mutate(payload);
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
      }}
      scrollViewRef={scrollViewRef} // Pass ref correctly
      header={<ScreenHeader title="" onBack={router.back} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          ลงทะเบียน
        </Text>
        <Text className="font-kanit text-gray-500" style={{ fontSize: 15, marginBottom: 24 }}>
          กรุณากรอกรายละเอียดของคุณเพื่อเข้าใช้งาน
        </Text>

        {/* Form Fields */}
        <View className="mb-6">
          {/* Row 1: Name & Lastname */}
          <View className="flex-row gap-3">
            {/* First Name */}
            <View className="flex-1">
              <FloatingLabelInput
                testID="firstName-input"
                label="ชื่อ"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            {/* Last Name */}
            <View className="flex-1">
              <FloatingLabelInput
                testID="lastName-input"
                label="นามสกุล"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Row 2: Gender */}
          <View>
            <GenderSelect value={gender} onChange={setGender} />
          </View>

          {/* Row 3: Phone */}
          <View>
            <FloatingLabelInput
              testID="phone-input"
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
          </View>

          {/* Row 4: Email */}
          <View>
            <FloatingLabelInput
              testID="email-input"
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
          </View>

          {/* Row 5: Password */}
          <View>
            <FloatingLabelInput
              testID="password-input"
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
          </View>

          {/* Password Strength Bar - Show when typing */}
          <View>
            <PasswordStrengthIndicator password={password} />
          </View>
        </View>

        {/* Register Button */}
        <PrimaryButton
          testID="register-button"
          title="ลงทะเบียน"
          onPress={handleRegister}
          loading={registerMutation.isPending}
        />

        {/* Login Link */}
        <View className="flex-row justify-center items-center mt-6">
          <Text className="font-kanit text-gray-500" style={{ fontSize: 15 }}>
            มีบัญชีอยู่แล้ว ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
            <Text className="font-kanit font-semibold" style={{ fontSize: 15, color: '#EB6A6A' }}>
              เข้าสู่ระบบ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
