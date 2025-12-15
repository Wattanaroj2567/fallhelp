import { useRouter } from 'expo-router';
import { Text, View, Alert, Linking, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Bounceable } from '@/components/Bounceable';
import { showErrorMessage } from '@/utils/errorHelper';

// Contact information
const SUPPORT_PHONE = '0659655508';
const SUPPORT_EMAIL = 'tawan.wattanaroth@gmail.com';
const SUPPORT_LINE = 'https://line.me/ti/p/F1E1611HW_';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Settings Screen
// ==========================================
export default function SettingsScreen() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Context)
  // Purpose: Use global auth context
  // ==========================================
  const { signOut } = useAuth();

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle logout
  // ==========================================
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onError: (error: unknown) => {
      showErrorMessage('ผิดพลาด', error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user actions
  // ==========================================
  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'ยืนยันการออกจากระบบของคุณหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ใช่',
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const handleCallPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleSendEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleOpenLine = () => {
    Linking.openURL(SUPPORT_LINE);
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    isLast = false,
    isDanger = false,
    iconColor,
    bgColor,
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
    title: string;
    onPress: () => void;
    isLast?: boolean;
    isDanger?: boolean;
    iconColor?: string;
    bgColor?: string;
  }) => (
    <Bounceable
      onPress={onPress}
      className={`flex-row items-center justify-between p-5 ${!isLast ? 'border-b border-gray-100' : ''} active:bg-gray-50`}
      scale={1}
      style={{ backgroundColor: 'white' }}
    >
      <View className="flex-row items-center justify-between flex-1">
        <View className="flex-row items-center flex-1">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              bgColor ? bgColor : isDanger ? 'bg-red-50' : 'bg-gray-50'
            }`}
          >
            <MaterialIcons
              name={icon}
              size={22}
              color={iconColor ? iconColor : isDanger ? '#EF4444' : '#898989'}
            />
          </View>
          <Text
            style={{ fontSize: 16, fontWeight: '500' }}
            className={`font-kanit ml-3 ${isDanger ? 'text-red-500' : 'text-gray-900'}`}
          >
            {title}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </Bounceable>
  );

  const ContactItem = ({
    icon,
    title,
    subtitle,
    onPress,
    iconColor = '#6366F1',
    bgColor = 'bg-indigo-50',
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
    title: string;
    subtitle: string;
    onPress: () => void;
    iconColor?: string;
    bgColor?: string;
  }) => (
    <Bounceable
      onPress={onPress}
      className="flex-row items-center p-5 active:bg-gray-50"
      scale={1}
      style={{ backgroundColor: 'white' }}
    >
      {/* Content wrapper view to ensure flex direction works if TH behaves like a wrapper */}
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${bgColor}`}>
          <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        <View className="ml-3 flex-1">
          <Text style={{ fontSize: 16, fontWeight: '500' }} className="font-kanit text-gray-900">
            {title}
          </Text>
          <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500">
            {subtitle}
          </Text>
        </View>
        <MaterialIcons name="open-in-new" size={18} color="#9CA3AF" />
      </View>
    </Bounceable>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render settings menu
  // ==========================================
  return (
    <ScreenWrapper
      edges={['top']}
      useScrollView={true}
      keyboardAvoiding={false}
      style={{ backgroundColor: '#FFFFFF' }}
      header={<ScreenHeader title="ตั้งค่า" />}
    >
      <View className="flex-1 pt-4">
        {/* Settings Section */}
        <View className="bg-white rounded-[24px] shadow-sm border border-gray-100">
          <View className="rounded-[24px] overflow-hidden">
            <MenuItem
              icon="people"
              title="จัดการสมาชิก"
              onPress={() => router.push('/(features)/(user)/members')}
            />
            <MenuItem
              icon="contact-phone"
              title="จัดการเบอร์ฉุกเฉินผู้สูงอายุ"
              onPress={() => router.push('/(features)/(emergency)')}
            />
            <MenuItem
              icon="chat-bubble"
              title="ส่งความคิดเห็น"
              onPress={() => router.push('/(features)/(user)/feedback')}
            />
            <MenuItem
              icon="logout"
              title="ออกจากระบบ"
              onPress={handleLogout}
              isLast={true}
              isDanger={true}
            />
          </View>
        </View>

        {/* Contact Section */}
        <View className="mt-6">
          <Text
            style={{ fontSize: 14, fontWeight: '600' }}
            className="font-kanit text-gray-700 mb-2 ml-2"
          >
            ติดต่อเรา
          </Text>
          <View className="bg-white rounded-[24px] shadow-sm border border-gray-100">
            <View className="rounded-[24px] overflow-hidden">
              <ContactItem
                icon="phone"
                title="โทรศัพท์"
                subtitle={SUPPORT_PHONE}
                onPress={handleCallPhone}
                iconColor="#898989"
                bgColor="bg-gray-50"
              />
              <View className="border-t border-gray-100" />
              <ContactItem
                icon="email"
                title="อีเมล"
                subtitle={SUPPORT_EMAIL}
                onPress={handleSendEmail}
                iconColor="#898989"
                bgColor="bg-gray-50"
              />
              <View className="border-t border-gray-100" />
              {/* LINE with custom icon */}
              <Bounceable
                onPress={handleOpenLine}
                className="p-5 active:bg-gray-50"
                scale={1}
                style={{ backgroundColor: 'white' }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full items-center justify-center">
                    <Image
                      source={require('@/assets/images/Lineicon.png')}
                      style={{ width: 28, height: 28 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      style={{ fontSize: 16, fontWeight: '500' }}
                      className="font-kanit text-gray-900"
                    >
                      LINE
                    </Text>
                    <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500">
                      คลิกเพื่อเพิ่มเพื่อน
                    </Text>
                  </View>
                  <MaterialIcons name="open-in-new" size={18} color="#9CA3AF" />
                </View>
              </Bounceable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className="mt-8 items-center mb-8">
          <View className="bg-gray-50 rounded-2xl py-4 px-6 items-center">
            <Text style={{ fontSize: 13, fontWeight: '600' }} className="font-kanit text-gray-700">
              FallHelp v1.0.0
            </Text>
            <Text style={{ fontSize: 11 }} className="font-kanit text-gray-500 mt-1">
              © 2025 Fall Detection System
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
