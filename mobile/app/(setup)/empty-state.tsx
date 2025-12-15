import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import Logger from '@/utils/logger';
import { getUserElders } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Welcome Screen for Setup Flow
// ==========================================
export default function SetupWelcome() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const { signOut } = useAuth();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Check for elder access (Invite or Created)
  // ==========================================
  const checkAccess = React.useCallback(
    async (manual = false) => {
      try {
        if (manual) setIsChecking(true);

        const elders = await getUserElders();

        if (elders && elders.length > 0) {
          // Found elder (either created or invited)
          Logger.info('Elder found, redirecting to tabs');

          // Save ID for persistence and mark setup as complete
          await SecureStore.setItemAsync('setup_elderId', String(elders[0].id));
          await SecureStore.setItemAsync('setup_step', 'complete');

          if (manual) {
            Alert.alert('สำเร็จ', 'พบข้อมูลผู้สูงอายุแล้ว เข้าสู่ระบบสำเร็จ', [
              { text: 'ตกลง', onPress: () => router.replace('/(tabs)') },
            ]);
          } else {
            router.replace('/(tabs)');
          }
          return true;
        } else {
          if (manual) {
            Alert.alert('ไม่พบคำเชิญ', 'ยังไม่พบข้อมูลผู้สูงอายุ (อาจต้องรอผู้ดูแลหลักเชิญก่อน)');
          }
          return false;
        }
      } catch (error) {
        Logger.error('Error checking access:', error);
        if (manual) {
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        }
        return false;
      } finally {
        if (manual) setIsChecking(false);
      }
    },
    [router],
  );

  useEffect(() => {
    // Initial silent check
    checkAccess();
  }, [checkAccess]);

  const handleCreateNew = async () => {
    // Start Setup Flow (Owner) - Create New Elder
    router.push('/(setup)/step1-elder-info');
  };

  const handleLogout = async () => {
    try {
      // Clear all setup-related ephemeral data
      await SecureStore.deleteItemAsync('setup_elderId');
      await SecureStore.deleteItemAsync('setup_step');

      await signOut();
      // signOut likely handles navigation, but to be sure:
      router.replace('/(auth)/login');
    } catch (e) {
      Logger.error('Logout error', e);
      router.replace('/(auth)/login');
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
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render welcome screen
  // ==========================================
  return (
    <ScreenWrapper useScrollView={false} style={{ backgroundColor: 'white' }}>
      <View className="flex-1 px-8 pt-10 pb-6 justify-between">
        {/* Top Content */}
        <View>
          {/* Logo Area */}
          <Animated.View style={[animatedStyle, { alignItems: 'center', marginBottom: 30 }]}>
            <Image
              source={require('../../assets/images/logoicon.png')}
              style={{ width: width * 0.6, height: 100 }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text
              style={{ fontSize: 24, fontWeight: 'bold' }}
              className="text-gray-900 mb-3 text-center font-kanit"
            >
              ยินดีต้อนรับสู่ FallHelp
            </Text>
            <Text
              style={{ fontSize: 16 }}
              className="text-gray-500 text-center mb-8 font-kanit px-4"
            >
              กรุณาเลือกรูปแบบการใช้งานของคุณ
            </Text>
          </Animated.View>

          {/* Options */}
          <View className="mt-2 gap-4">
            {/* Option 1: Owner (Create New) */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateNew}
                className="bg-green-50 rounded-2xl p-5 border-2 border-green-100 flex-row items-center active:bg-green-100"
              >
                <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mr-4">
                  <MaterialIcons name="add-moderator" size={28} color="#16AD78" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontSize: 18, fontWeight: '700' }}
                    className="text-gray-900 font-kanit mb-1"
                  >
                    สร้างบัญชีผู้สูงอายุใหม่
                  </Text>
                  <Text
                    style={{ fontSize: 13, lineHeight: 18 }}
                    className="text-gray-600 font-kanit"
                  >
                    สำหรับผู้ที่มีอุปกรณ์ FallHelp และต้องการเป็นผู้ดูแลหลัก
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#16AD78" />
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              className="flex-row items-center justify-center my-2"
            >
              <View className="h-[1px] bg-gray-200 w-16" />
              <Text className="mx-3 text-gray-400 font-kanit text-sm">หรือ</Text>
              <View className="h-[1px] bg-gray-200 w-16" />
            </Animated.View>

            {/* Option 2: Member (Join Existing) */}
            <Animated.View entering={FadeInDown.delay(600).duration(600)}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => checkAccess(true)}
                disabled={isChecking}
                className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100 flex-row items-center active:bg-blue-100"
              >
                <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <MaterialIcons name="group-add" size={28} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontSize: 18, fontWeight: '700' }}
                    className="text-gray-900 font-kanit mb-1"
                  >
                    เข้าร่วมครอบครัวเดิม
                  </Text>
                  <Text
                    style={{ fontSize: 13, lineHeight: 18 }}
                    className="text-gray-600 font-kanit"
                  >
                    สำหรับญาติที่ได้รับคำเชิญทางอีเมลแล้ว กดเพื่อเริ่มใช้งาน
                  </Text>
                </View>
                {isChecking ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <MaterialIcons name="refresh" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Bottom Action */}
        <Animated.View
          entering={FadeInDown.delay(1000).duration(600)}
          className="items-center pb-4"
        >
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center px-6 py-3 rounded-full bg-gray-100 active:bg-gray-200"
          >
            <MaterialIcons name="logout" size={18} color="#9CA3AF" style={{ marginRight: 6 }} />
            <Text className="text-gray-500 font-kanit font-medium text-base">ออกจากระบบ</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12 }} className="text-gray-300 text-center font-kanit mt-4">
            v1.0.0
          </Text>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}
