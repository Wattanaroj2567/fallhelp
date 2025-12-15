import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { submitFeedback } from '@/services/feedbackService';
import { getProfile } from '@/services/userService';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import Logger from '@/utils/logger';
import { showErrorMessage } from '@/utils/errorHelper';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: User Feedback Submission Screen
// ==========================================
export default function FeedbackScreen() {
  const router = useRouter();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage feedback message
  // ==========================================
  const [isFocused, setIsFocused] = useState(false);

  const [message, setMessage] = useState('');

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch user profile for userName
  // ==========================================
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Submit feedback with userName
  // ==========================================
  const feedbackMutation = useMutation({
    mutationFn: (data: { message: string; userName?: string }) => submitFeedback(data),
    onSuccess: () => {
      Alert.alert(
        'ส่งความคิดเห็นสำเร็จ',
        'ขอบคุณสำหรับคำแนะนำ เราจะนำไปปรับปรุงระบบให้ดียิ่งขึ้น',
        [{ text: 'ตกลง', onPress: () => router.back() }],
      );
    },
    onError: (error: unknown) => {
      Logger.error('Error submitting feedback:', error);
      showErrorMessage('ข้อผิดพลาด', error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle feedback submission
  // ==========================================
  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกความคิดเห็นของคุณ');
      return;
    }

    const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : undefined;

    Logger.info('Submitting feedback with userName:', userName);
    feedbackMutation.mutate({ message: message.trim(), userName });
  };

  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, flex: 1 }}
      useScrollView={false}
      header={<ScreenHeader title="ส่งความคิดเห็น" onBack={() => router.back()} />}
    >
      <View className="pt-2">
        {/* Description */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text
            style={{ fontSize: 15, fontWeight: '500' }}
            className="font-kanit text-blue-700 mb-1"
          >
            ความคิดเห็นของคุณมีค่าสำหรับเรา
          </Text>
          <Text style={{ fontSize: 14 }} className="font-kanit text-blue-600">
            ช่วยแนะนำติชมเพื่อให้เราปรับปรุง FallHelp ให้ดียิ่งขึ้น
          </Text>
        </View>

        {/* User Info Display */}
        {userProfile && (
          <View className="bg-gray-50 rounded-xl p-3 mb-4 flex-row items-center">
            <MaterialIcons name="person" size={20} color="#898989" />
            <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 ml-2">
              ส่งโดย: {userProfile.firstName} {userProfile.lastName}
            </Text>
          </View>
        )}

        {/* Message Input */}
        <View
          className="bg-white rounded-2xl p-4 border mb-6"
          style={{
            height: 150,
            borderColor: isFocused ? '#16AD78' : '#E5E7EB',
          }}
        >
          <TextInput
            className="font-kanit text-gray-900 text-base"
            placeholder="พิมพ์ข้อความของคุณที่นี่..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ height: 100 }}
            maxLength={500}
          />
          <Text style={{ fontSize: 12 }} className="font-kanit text-gray-400 text-right mt-2">
            {message.length}/500
          </Text>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title="ส่งความคิดเห็น"
          onPress={handleSubmit}
          loading={feedbackMutation.isPending}
        />
      </View>
    </ScreenWrapper>
  );
}
