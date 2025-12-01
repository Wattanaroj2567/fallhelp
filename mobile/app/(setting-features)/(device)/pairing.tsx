import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { QrCode, ArrowRight, X } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { pairDevice } from '../../../services/deviceService';
import { getToken } from '../../../services/tokenStorage';
import { apiClient } from '../../../services/api';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;

// ==========================================
// 📱 LAYER: View (Screen)
// Purpose: Device Pairing Screen (QR Scan + Manual)
// ==========================================

export default function DevicePairing() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isManual, setIsManual] = useState(false);

  // Focus State
  const [codeFocused, setCodeFocused] = useState(false);

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

  const codeAnim = useInputAnimation(codeFocused, manualCode);

  // Check permissions on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const pairMutation = useMutation({
    mutationFn: async (deviceCode: string) => {
      // We need elderId. For now, let's assume we are pairing for the first elder found or pass it via params.
      // Ideally, this screen should receive elderId as param.
      // If not provided, we might need to fetch elders or ask user.
      // For this flow, let's assume we fetch the user's first elder if not provided.

      // Fetch user's elders to get an ID
      const { data: eldersData } = await apiClient.get('/api/elders');
      const elderId = eldersData.elders[0]?.id;

      if (!elderId) {
        throw new Error('ไม่พบข้อมูลผู้สูงอายุ กรุณาสร้างข้อมูลผู้สูงอายุก่อน');
      }

      return pairDevice({ deviceCode, elderId });
    },
    onSuccess: (data, variables) => {
      Alert.alert(
        'จับคู่สำเร็จ',
        `อุปกรณ์ ${variables} ถูกจับคู่เรียบร้อยแล้ว`,
        [
          {
            text: 'ไปตั้งค่า WiFi',
            onPress: () => router.replace({
              pathname: '/(setting-features)/(device)/wifi-config',
              params: { deviceCode: variables }
            }),
          },
        ]
      );
    },
    onError: (error: any) => {
      setScanned(false);
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถจับคู่อุปกรณ์ได้');
    },
  });

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Assume QR code contains just the device code or a JSON
    let code = data;
    try {
      const json = JSON.parse(data);
      if (json.deviceCode) code = json.deviceCode;
    } catch (e) {
      // Not JSON, use raw data
    }

    Alert.alert(
      'พบอุปกรณ์',
      `รหัส: ${code}`,
      [
        { text: 'ยกเลิก', onPress: () => setScanned(false), style: 'cancel' },
        { text: 'จับคู่', onPress: () => pairMutation.mutate(code) },
      ]
    );
  };

  const handleManualSubmit = () => {
    if (!manualCode) {
      Alert.alert('กรุณาระบุ', 'กรุณากรอกรหัสอุปกรณ์');
      return;
    }
    pairMutation.mutate(manualCode);
  };

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-lg font-kanit text-center mb-4">
          ต้องการสิทธิ์การใช้งานกล้องเพื่อสแกน QR Code
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-kanit-bold">อนุญาตให้ใช้กล้อง</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {!isManual ? (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <SafeAreaView className="flex-1">
            {/* Overlay */}
            <View className="flex-1 bg-black/50">
              <View className="p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
                  <X size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-kanit-bold text-lg">สแกน QR Code</Text>
                <View className="w-10" />
              </View>

              <View className="flex-1 items-center justify-center">
                <View className="w-64 h-64 border-2 border-white rounded-3xl bg-transparent relative">
                  <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                  <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                  <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                  <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                </View>
                <Text className="text-white font-kanit mt-8 text-center px-10">
                  วาง QR Code ให้อยู่ในกรอบเพื่อสแกนอัตโนมัติ
                </Text>
              </View>

              <View className="p-8 bg-black/80 rounded-t-3xl">
                <TouchableOpacity
                  onPress={() => setIsManual(true)}
                  className="bg-white/10 py-4 rounded-xl flex-row items-center justify-center border border-white/20"
                >
                  <QrCode size={20} color="white" />
                  <Text className="text-white font-kanit-medium ml-2">
                    กรอกรหัสด้วยตนเอง
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </CameraView>
      ) : (
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View className="p-4 border-b border-gray-100 flex-row items-center">
              <TouchableOpacity onPress={() => setIsManual(false)} className="p-2 -ml-2">
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text className="text-lg font-kanit font-bold text-gray-900 ml-2">
                กรอกรหัสอุปกรณ์
              </Text>
            </View>

            <View className="p-6">
              <Text className="text-gray-500 font-kanit mb-4">
                รหัสอุปกรณ์ (Device Code) ระบุอยู่ที่สติ๊กเกอร์ข้างกล่องหรือใต้เครื่อง
              </Text>

              <View className="mb-6">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, codeAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[codeAnim.textStyle]}>FH-DEV-XXX</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${codeFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholderTextColor="#9CA3AF"
                    value={manualCode}
                    onChangeText={setManualCode}
                    autoCapitalize="characters"
                    autoFocus
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleManualSubmit}
                disabled={pairMutation.isPending}
                className={`flex-row items-center justify-center h-14 rounded-xl ${pairMutation.isPending ? 'bg-blue-300' : 'bg-blue-600'
                  }`}
              >
                {pairMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-kanit text-lg mr-2 font-bold">
                      ตรวจสอบและจับคู่
                    </Text>
                    <ArrowRight size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </View>
  );
}