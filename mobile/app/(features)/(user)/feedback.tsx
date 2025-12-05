import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from '@/services/feedbackService';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function FeedbackScreen() {
    const router = useRouter();
    const [message, setMessage] = useState('');

    const feedbackMutation = useMutation({
        mutationFn: submitFeedback,
        onSuccess: () => {
            Alert.alert(
                'ส่งความคิดเห็นสำเร็จ',
                'ขอบคุณสำหรับคำแนะนำ เราจะนำไปปรับปรุงระบบให้ดียิ่งขึ้น',
                [{ text: 'ตกลง', onPress: () => router.back() }]
            );
        },
        onError: (error: any) => {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งความคิดเห็นได้ กรุณาลองใหม่ภายหลัง');
        },
    });

    const handleSubmit = () => {
        if (!message.trim()) {
            Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกความคิดเห็นของคุณ');
            return;
        }
        feedbackMutation.mutate(message);
    };

    return (
        <ScreenWrapper contentContainerStyle={{ padding: 24, paddingTop: 6, flexGrow: 1 }} useScrollView={false}>
            <ScreenHeader title="ส่งความคิดเห็น" onBack={() => router.back()} />

            <View className="flex-1 px-6 pt-2">
                <Text style={{ fontSize: 16 }} className="font-kanit text-gray-700 mb-4">
                    ความคิดเห็นของคุณมีค่าสำหรับเรา ช่วยแนะนำติชมเพื่อให้เราปรับปรุง FallHelp ให้ดียิ่งขึ้น
                </Text>

                <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-6" style={{ minHeight: 120 }}>
                    <TextInput
                        className="font-kanit text-gray-900 text-base"
                        placeholder="พิมพ์ข้อความของคุณที่นี่..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                        style={{ minHeight: 100 }}
                    />
                </View>

                <PrimaryButton
                    title="ส่งความคิดเห็น"
                    onPress={handleSubmit}
                    loading={feedbackMutation.isPending}
                />
            </View>
        </ScreenWrapper>
    );
}
