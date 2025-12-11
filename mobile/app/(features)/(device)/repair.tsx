import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitFeedback, getFeedbackHistory } from "@/services/feedbackService";
import { getProfile } from "@/services/userService";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UserInput } from "@/components/UserInput";
import { TabSelector } from "@/components/TabSelector";
import Logger from "@/utils/logger";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Device Repair Request Screen
// ==========================================
export default function RepairScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // ==========================================
    // 🧩 LAYER: Logic (Local State)
    // Purpose: Manage repair details
    // ==========================================
    const [activeTab, setActiveTab] = useState(0);
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");

    // ==========================================
    // ⚙️ LAYER: Logic (Data Fetching)
    // Purpose: Fetch user profile & History
    // ==========================================
    const { data: userProfile } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getProfile,
    });

    const { data: historyItems, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ["repairHistory"],
        queryFn: getFeedbackHistory,
        enabled: activeTab === 1, // Only fetch when switching to history tab
    });

    // ==========================================
    // ⚙️ LAYER: Logic (Mutation)
    // Purpose: Submit repair request (using feedback API for now)
    // ==========================================
    const repairMutation = useMutation({
        mutationFn: (data: { message: string; userName?: string }) =>
            submitFeedback(data),
        onSuccess: () => {
            Alert.alert(
                "ส่งเรื่องแจ้งซ่อมสำเร็จ",
                "เราได้รับข้อมูลแล้ว ทีมงานจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด",
                [
                    {
                        text: "ตกลง",
                        onPress: () => {
                            setActiveTab(1); // Switch to history tab
                            queryClient.invalidateQueries({ queryKey: ["repairHistory"] });
                            setMessage("");
                            setSubject("");
                        }
                    }
                ]
            );
        },
        onError: (error: any) => {
            Logger.error("Error submitting repair request:", error);
            Alert.alert(
                "ข้อผิดพลาด",
                "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่ภายหลัง"
            );
        },
    });

    // ==========================================
    // 🎮 LAYER: Logic (Event Handlers)
    // Purpose: Handle submission
    // ==========================================
    const handleSubmit = () => {
        if (!message.trim() || !subject.trim()) {
            Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณาระบุหัวข้อและรายละเอียดปัญหา");
            return;
        }

        const userName = userProfile
            ? `${userProfile.firstName} ${userProfile.lastName}`
            : undefined;

        const fullMessage = `[REPAIR REQUEST] Topic: ${subject}\nDetails: ${message}`;

        Logger.info("Submitting repair request:", fullMessage);
        repairMutation.mutate({ message: fullMessage, userName });
    };

    // ==========================================
    // 🖼️ LAYER: View (Main Render)
    // Purpose: Render repair form
    // ==========================================
    return (
        <ScreenWrapper
            edges={["top", "left", "right"]}
            useScrollView={false}
            style={{ backgroundColor: "#FFFFFF" }}
        >
            {/* Header */}
            <ScreenHeader title="แจ้งปัญหา / ส่งซ่อม" onBack={() => router.back()} />

            {/* Content ScrollView */}
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-4">
                    {/* Tab Selector */}
                    <TabSelector
                        tabs={["แจ้งปัญหา", "ติดตามสถานะ"]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {activeTab === 0 ? (
                        // FORM VIEW
                        <View className="gap-5">
                            {/* Hero Icon & Info - Moved inside form view to keep history clean */}
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 rounded-full bg-yellow-50 items-center justify-center border-4 border-white shadow-sm shadow-yellow-100">
                                    <MaterialIcons name="build" size={40} color="#EAB308" />
                                </View>
                            </View>

                            {/* Subject Input */}
                            <View>
                                <Text className="font-kanit font-bold text-gray-700 mb-2 ml-1">หัวข้อปัญหา</Text>
                                <UserInput
                                    placeholder="เช่น เครื่องไม่เชื่อมต่อ, ไฟไม่ติด"
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                            </View>

                            {/* Description Input */}
                            <View>
                                <Text className="font-kanit font-bold text-gray-700 mb-2 ml-1">รายละเอียด</Text>
                                <UserInput
                                    placeholder="อธิบายอาการที่พบให้เราทราบ..."
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    style={{ height: 128, textAlignVertical: 'top' }}
                                />
                            </View>

                            {/* Contact Info Preview */}
                            {userProfile && (
                                <View className="mt-2 flex-row items-center justify-center space-x-2 opacity-60">
                                    <MaterialIcons name="contact-support" size={16} color="#6B7280" />
                                    <Text className="font-kanit text-gray-500 text-xs">
                                        ติดต่อกลับ: {userProfile.firstName} {userProfile.lastName}
                                    </Text>
                                </View>
                            )}

                            <View className="h-4" />

                            <PrimaryButton
                                title="ส่งแจ้งซ่อม"
                                onPress={handleSubmit}
                                loading={repairMutation.isPending}
                                disabled={!message.trim() || !subject.trim()}
                                style={{ backgroundColor: '#EAB308' }}
                            />
                        </View>
                    ) : (
                        // HISTORY VIEW
                        <View className="gap-4">
                            {isLoadingHistory ? (
                                <ActivityIndicator className="mt-8" color="#EAB308" />
                            ) : historyItems?.length === 0 ? (
                                <View className="items-center justify-center py-12 opacity-50">
                                    <MaterialIcons name="history" size={48} color="#9CA3AF" />
                                    <Text className="font-kanit text-gray-400 mt-4 text-center">ยังไม่มีประวัติการแจ้งซ่อม</Text>
                                </View>
                            ) : (
                                historyItems?.map((item) => {
                                    // Parse Subject from Message "[REPAIR REQUEST] Topic: ... \nDetails: ..."
                                    const topicMatch = item.message.match(/Topic: (.*?)\n/);
                                    const displayTitle = topicMatch ? topicMatch[1] : "แจ้งปัญหาทั่วไป";
                                    const isRepair = item.message.includes("[REPAIR REQUEST]");

                                    // Only show Repair Requests in this list? Or all feedback?
                                    // User asked for "Repair Status", so let's highlight repairs.

                                    return (
                                        <View key={item.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex-row gap-4">
                                            <View className={`w-2 rounded-full ${item.status === 'RESOLVED' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start">
                                                    <Text className="font-kanit font-bold text-gray-800 text-base mb-1" numberOfLines={1}>
                                                        {displayTitle}
                                                    </Text>
                                                    <Text className="font-kanit text-xs text-gray-400">
                                                        {new Date(item.createdAt).toLocaleDateString('th-TH')}
                                                    </Text>
                                                </View>

                                                <Text className="font-kanit text-gray-500 text-sm mb-2" numberOfLines={2}>
                                                    {item.message.replace(/\[REPAIR REQUEST\] Topic: .*?\nDetails: /, "")}
                                                </Text>

                                                <View className="flex-row gap-2">
                                                    <View className={`px-2 py-1 rounded-md ${item.status === 'RESOLVED' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                                        <Text className={`font-kanit text-[10px] font-bold ${item.status === 'RESOLVED' ? 'text-green-700' : 'text-yellow-700'}`}>
                                                            {item.status === 'RESOLVED' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                                                        </Text>
                                                    </View>
                                                    {isRepair && (
                                                        <View className="bg-gray-100 px-2 py-1 rounded-md">
                                                            <Text className="font-kanit text-[10px] text-gray-500">ซ่อมบำรุง</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })
                            )}

                            {/* Refresh Button (Small) */}
                            <TouchableOpacity onPress={() => refetchHistory()} className="self-center p-2 opacity-50">
                                <MaterialIcons name="refresh" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAwareScrollView>
        </ScreenWrapper>
    );
}
