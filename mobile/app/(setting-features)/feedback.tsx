import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from '@/services/feedbackService';

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '600' }} className="font-kanit text-gray-900">
                    ส่งความคิดเห็น
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 pt-6">
                    <Text style={{ fontSize: 16 }} className="font-kanit text-gray-700 mb-4">
                        ความคิดเห็นของคุณมีค่าสำหรับเรา ช่วยแนะนำติชมเพื่อให้เราปรับปรุง FallHelp ให้ดียิ่งขึ้น
                    </Text>

                    <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-6 h-64">
                        <TextInput
                            className="flex-1 font-kanit text-gray-900 text-base"
                            placeholder="พิมพ์ข้อความของคุณที่นี่..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={feedbackMutation.isPending}
                        className={`rounded-2xl py-4 items-center ${feedbackMutation.isPending ? 'bg-gray-300' : 'bg-[#16AD78]'}`}
                    >
                        {feedbackMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                                ส่งความคิดเห็น
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
