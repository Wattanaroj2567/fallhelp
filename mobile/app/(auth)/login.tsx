import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
const PASSWORD_ICON_SIZE = 22;
const PRIMARY_COLOR = '#16AD78';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Login Screen
// ==========================================
export default function LoginScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs and focus state
  // ==========================================
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================
  const emailProgress = useDerivedValue(
    () => withTiming(emailFocused || !!email ? 1 : 0, { duration: 200 }),
    [emailFocused, email]
  );
  const passwordProgress = useDerivedValue(
    () => withTiming(passwordFocused || !!password ? 1 : 0, { duration: 200 }),
    [passwordFocused, password]
  );

  const emailLabelContainerStyle = useAnimatedStyle(() => ({
    top: interpolate(emailProgress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: emailProgress.value > 0.5 ? '#FFFFFF' : 'transparent',
  }));

  const emailLabelTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(emailProgress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: emailFocused ? PRIMARY_COLOR : '#9CA3AF',
  }));

  const passwordLabelContainerStyle = useAnimatedStyle(() => ({
    top: interpolate(passwordProgress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: passwordProgress.value > 0.5 ? '#FFFFFF' : 'transparent',
  }));

  const passwordLabelTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(passwordProgress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: passwordFocused ? PRIMARY_COLOR : '#9CA3AF',
  }));

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle login API call
  // ==========================================
  const loginMutation = useMutation({
    mutationFn: async () => {
      return await login({ email, password });
    },
    onSuccess: (response) => {
      console.log('Login successful:', response);
      Alert.alert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับกลับ');
      // เปลี่ยนไปแท็บหลัก (index จะเป็นจอแรกใน TabLayout)
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
      Alert.alert('เข้าสู่ระบบล้มเหลว', message);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (emailError) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลเป็นภาษาอังกฤษ');
      return;
    }

    loginMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render login form
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Logo Section */}
            <View className="items-center mb-8">
              <Image
                source={require('../../assets/images/logoicon.png')}
                style={{ width: 180, height: 180 }}
                resizeMode="contain"
              />
            </View>

            {/* Form Section */}
            <View className="w-full max-w-md mx-auto">
              {/* Email Input with Floating Label */}
              <View className="mb-3">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        left: 16,
                        paddingHorizontal: 4,
                        zIndex: 1,
                      },
                      emailLabelContainerStyle,
                    ]}
                  >
                    <Animated.Text className="font-kanit" style={[emailLabelTextStyle]}>
                      อีเมล
                    </Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${emailFocused ? 'border-[#16AD78]' : emailError ? 'border-red-500' : 'border-gray-300'
                      } bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
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
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? (
                  <Text className="font-kanit text-red-500 text-xs mt-1 ml-2">{emailError}</Text>
                ) : null}
              </View>

              {/* Password Input with Floating Label */}
              <View className="mb-3">
                <View
                  style={{ height: INPUT_HEIGHT, position: 'relative' }}
                  className={`rounded-2xl px-4 border ${passwordFocused ? 'border-[#16AD78]' : 'border-gray-300'} bg-white justify-center`}
                >
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        left: 16,
                        paddingHorizontal: 4,
                        zIndex: 1,
                      },
                      passwordLabelContainerStyle,
                    ]}
                  >
                    <Animated.Text className="font-kanit" style={[passwordLabelTextStyle]}>
                      รหัสผ่าน
                    </Animated.Text>
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
                    onChangeText={setPassword}
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
                      size={22}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                className="self-end mb-8"
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280' }}>ลืมรหัสผ่าน ?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                className={`bg-[#16AD78] rounded-2xl py-4 items-center mb-5 ${loginMutation.isPending ? 'opacity-70' : ''}`}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                activeOpacity={0.8}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-kanit" style={{ fontSize: 17, color: '#FFFFFF', fontWeight: '600' }}>เข้าสู่ระบบ</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row justify-center items-center">
                <Text className="font-kanit" style={{ fontSize: 14, color: '#6B7280' }}>ยังไม่มีบัญชี ? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  activeOpacity={0.7}
                >
                  <Text className="font-kanit" style={{ fontSize: 14, color: '#EB6A6A', fontWeight: '600' }}>สมัครสมาชิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
