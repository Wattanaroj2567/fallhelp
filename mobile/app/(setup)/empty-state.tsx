import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInDown
} from 'react-native-reanimated';
import Logger from '@/utils/logger';

const { width } = Dimensions.get('window');

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Welcome Screen for Setup Flow
// ==========================================
export default function SetupWelcome() {
  const router = useRouter();
  const [existingElderId, setExistingElderId] = React.useState<string | null>(null);

  useEffect(() => {
    const checkExistingElder = async () => {
      try {
        const { getUserElders } = require('../../services/userService');
        const { listElders } = require('../../services/elderService');
        const SecureStore = require('expo-secure-store');

        // Check if we have a saved elder ID in SecureStore first
        const savedElderId = await SecureStore.getItemAsync('setup_elderId');
        if (savedElderId) {
          setExistingElderId(savedElderId);
          return;
        }

        // Fallback: Check API
        const elders = await getUserElders();
        if (elders && elders.length > 0) {
          // Save the first elder ID for setup
          await SecureStore.setItemAsync('setup_elderId', String(elders[0].id));
          setExistingElderId(String(elders[0].id));
        }
      } catch (error) {
        Logger.error('Error checking existing elder:', error);
      }
    };
    checkExistingElder();
  }, []);

  const handleStart = async () => {
    if (existingElderId) {
      router.push('/(setup)/step2-device-pairing');
    } else {
      router.push('/(setup)/step1-elder-info');
    }
  };

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle entrance animations
  // ==========================================
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const FeatureItem = ({ icon, title, delay }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; delay: number }) => (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      className="flex-row items-center mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100"
    >
      <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
        <MaterialIcons name={icon} size={20} color="#16AD78" />
      </View>
      <Text style={{ fontSize: 16 }} className="text-gray-700 flex-1 font-kanit">
        {title}
      </Text>
    </Animated.View>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render welcome screen
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 pt-10 pb-6 justify-between">

        {/* Top Content */}
        <View>
          {/* Logo Area */}
          <Animated.View style={[animatedStyle, { alignItems: 'center', marginBottom: 20 }]}>
            <Image
              source={require('../../assets/images/logoicon.png')}
              style={{ width: width * 0.85, height: 140 }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text style={{ fontSize: 28, fontWeight: 'bold' }} className="text-gray-900 mb-2 text-center font-kanit">
              ยินดีต้อนรับ
            </Text>
            <Text style={{ fontSize: 16 }} className="text-gray-500 text-center mb-8 font-kanit">
              เริ่มต้นใช้งานง่ายๆ เพียง 3 ขั้นตอน
            </Text>
          </Animated.View>

          {/* Features / Steps Preview */}
          <View className="mt-4">
            <FeatureItem
              icon="person-add"
              title="สร้างข้อมูลผู้สูงอายุ"
              delay={400}
            />
            <FeatureItem
              icon="watch"
              title="เชื่อมต่ออุปกรณ์ตรวจจับ"
              delay={600}
            />
            <FeatureItem
              icon="wifi"
              title="ตั้งค่าการเชื่อมต่อ WiFi"
              delay={800}
            />
          </View>
        </View>

        {/* Bottom Action */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStart}
            className="bg-[#16AD78] rounded-2xl py-4 items-center"
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }} className="text-white font-kanit">
              {existingElderId ? 'ดำเนินการต่อ (ขั้นตอนที่ 2)' : 'เริ่มต้นใช้งาน'}
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 12 }} className="text-gray-400 text-center mt-4 font-kanit">
            เวอร์ชัน 1.0.0
          </Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}