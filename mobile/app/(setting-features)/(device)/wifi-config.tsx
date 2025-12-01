import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Wifi, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { configureWifi } from '../../../services/deviceService';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;
const PASSWORD_ICON_SIZE = 24;

// ==========================================
// 📱 LAYER: View (Screen)
// Purpose: WiFi Configuration Screen (Manual Input for Demo)
// ==========================================

export default function WifiConfig() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceCode = params.deviceCode as string;

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Focus State
  const [ssidFocused, setSsidFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const ssidAnim = useInputAnimation(ssidFocused, ssid);
  const passwordAnim = useInputAnimation(passwordFocused, password);

  const configureMutation = useMutation({
    mutationFn: (data: { ssid: string; password: string }) =>
      configureWifi(deviceCode, { ssid: data.ssid, wifiPassword: data.password }),
    onSuccess: () => {
      Alert.alert(
        'สำเร็จ',
        'ส่งข้อมูลการตั้งค่า WiFi ไปยังอุปกรณ์แล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถตั้งค่า WiFi ได้');
    },
  });

  const handleConnect = () => {
    if (!ssid) {
      Alert.alert('กรุณาระบุ', 'กรุณากรอกชื่อ WiFi (SSID)');
      return;
    }
    configureMutation.mutate({ ssid, password });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-6 mb-8">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Wifi size={32} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-kanit font-bold text-gray-900">
              ตั้งค่า WiFi
            </Text>
            <Text className="text-gray-500 font-kanit mt-2">
              กรอกข้อมูล WiFi ที่ต้องการให้อุปกรณ์เชื่อมต่อ
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, ssidAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[ssidAnim.textStyle]}>ชื่อ WiFi (SSID)</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${ssidFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={ssid}
                  onChangeText={setSsid}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setSsidFocused(true)}
                  onBlur={() => setSsidFocused(false)}
                />
              </View>
            </View>

            <View>
              <View
                style={{ height: INPUT_HEIGHT, position: 'relative' }}
                className={`rounded-2xl px-4 border ${passwordFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white justify-center`}
              >
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, passwordAnim.containerStyle]}>
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
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4"
                  style={{ top: INPUT_HEIGHT / 2 - PASSWORD_ICON_SIZE / 2, zIndex: 10 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={PASSWORD_ICON_SIZE}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View className="mt-8 bg-blue-50 p-4 rounded-xl flex-row items-start">
            <AlertCircle size={20} color="#3B82F6" className="mt-0.5" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 font-kanit font-medium mb-1">คำแนะนำ</Text>
              <Text className="text-blue-600 font-kanit text-sm leading-5">
                รองรับเฉพาะ WiFi ความถี่ 2.4GHz เท่านั้น ไม่รองรับ 5GHz
              </Text>
            </View>
          </View>

          {/* Footer Button inside ScrollView to avoid keyboard covering */}
          <View className="mt-8 mb-6">
            <TouchableOpacity
              onPress={handleConnect}
              disabled={configureMutation.isPending}
              className={`flex-row items-center justify-center h-14 rounded-xl ${configureMutation.isPending ? 'bg-blue-300' : 'bg-blue-600'
                }`}
            >
              {configureMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-kanit text-lg mr-2 font-bold">
                    เชื่อมต่อ
                  </Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
