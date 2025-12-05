import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Success Screen (Register/Reset Password)
// ==========================================
export default function AuthSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as string; // 'register' | 'reset_password'

  // Config ตามรูป
  const isReset = type === 'reset_password';
  const title = isReset ? 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว' : 'ลงทะเบียนสำเร็จ!';
  const description = isReset
    ? 'รอสักครู่ ! ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ'
    : 'ยินดีต้อนรับสู่ FallHelp\nบัญชีของคุณถูกสร้างเรียบร้อยแล้ว';

  const iconColor = '#16AD78'; // สีเขียว
  const titleColor = '#16AD78'; // สีเขียวตามรูป

  // Auto Redirect Logic
  // ==========================================
  // ⚙️ LAYER: Logic (Side Effects)
  // Purpose: Auto redirect to login
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (type === 'register') {
        // Go to setup flow
        router.replace('/(setup)/empty-state');
      } else {
        // Reset stack and go to login
        router.replace('/(auth)/login');
      }
    }, 3000); // 3 วินาที

    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render success message
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">

      {/* Success Icon */}
      <View className="mb-6 items-center justify-center">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: iconColor,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MaterialIcons name="check" size={50} color="white" />
        </View>
      </View>

      {/* Text Content */}
      <Text
        className="font-kanit text-2xl font-bold text-center mb-2"
        style={{ color: titleColor }}
      >
        {title}
      </Text>

      <Text
        className="font-kanit text-base text-gray-500 text-center leading-6"

      >
        {description}
      </Text>

    </SafeAreaView>
  );
}