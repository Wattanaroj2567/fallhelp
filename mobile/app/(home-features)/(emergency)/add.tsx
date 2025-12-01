import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createContact, listContacts } from '@/services/emergencyContactService';
import { getUserElders } from '@/services/userService';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14; // Adjusted to match existing design
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;

export default function AddEmergencyContact() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [elderId, setElderId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  // Focus State
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [relFocused, setRelFocused] = useState(false);

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

  const nameAnim = useInputAnimation(nameFocused, name);
  const phoneAnim = useInputAnimation(phoneFocused, phone);
  const relAnim = useInputAnimation(relFocused, relationship);

  useEffect(() => {
    fetchElderId();
  }, []);

  const fetchElderId = async () => {
    try {
      const elders = await getUserElders();
      if (elders && elders.length > 0) {
        setElderId(elders[0].id);
      }
    } catch (error) {
      console.error('Error fetching elder:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    if (!elderId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้สูงอายุ');
      return;
    }

    setLoading(true);
    try {
      // Get current contacts to determine next priority
      const currentContacts = await listContacts(elderId);

      // Find the maximum priority and add 1
      let nextPriority = 1;
      if (Array.isArray(currentContacts) && currentContacts.length > 0) {
        const maxPriority = Math.max(...currentContacts.map(c => c.priority || 0));
        nextPriority = maxPriority + 1;
      }

      await createContact(elderId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
        priority: nextPriority,
      });

      Alert.alert(
        'สำเร็จ',
        'เพิ่มเบอร์ติดต่อฉุกเฉินเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding contact:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถเพิ่มข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
          เพิ่มเบอร์ติดต่อฉุกเฉิน
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6">
            {/* Name Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, nameAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[nameAnim.textStyle]}>ชื่อผู้ติดต่อ</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${nameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Phone Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, phoneAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[phoneAnim.textStyle]}>เบอร์ติดต่อ</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${phoneFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={phone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 10) {
                      setPhone(cleaned);
                    }
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Relationship Field */}
            <View className="mb-6">
              <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, relAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[relAnim.textStyle]}>ความสัมพันธ์</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit h-[60px] rounded-2xl px-4 border ${relFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    height: 60,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}
                  value={relationship}
                  onChangeText={setRelationship}
                  onFocus={() => setRelFocused(true)}
                  onBlur={() => setRelFocused(false)}
                />
              </View>
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row">
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1 ml-2">
                ระบบจะโทรติดต่อผู้ติดต่อฉุกเฉินตามลำดับความสำคัญเมื่อเกิดเหตุการณ์ฉุกเฉิน
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-[#16AD78] rounded-2xl py-4 items-center mb-4"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  ยืนยัน
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
