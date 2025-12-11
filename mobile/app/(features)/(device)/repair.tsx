import React, { useState, useRef } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitFeedback, getRepairHistory, deleteRepairRequest } from "@/services/feedbackService";
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
    const [subjectFocused, setSubjectFocused] = useState(false);
    const [messageFocused, setMessageFocused] = useState(false);

    // Track open swipeable to close when another is opened
    const openSwipeableRef = useRef<Swipeable | null>(null);

    // ==========================================
    // ⚙️ LAYER: Logic (Data Fetching)
    // Purpose: Fetch user profile & History
    // ==========================================
    const { data: userProfile } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getProfile,
    });

    const { data: historyItems, isLoading: isLoadingHistory, refetch: refetchHistory, isFetching: isFetchingHistory, error: historyError } = useQuery({
        queryKey: ["repairHistory"],
        queryFn: async () => {
            Logger.info("Fetching repair history...");
            const result = await getRepairHistory();
            Logger.info("Repair history result:", result);
            return result;
        },
        staleTime: 0, // Always consider data stale for immediate refetch
        refetchInterval: 30000, // Auto-refresh every 30 seconds to get status updates
    });

    // ==========================================
    // ⚙️ LAYER: Logic (Mutation)
    // Purpose: Submit repair request (using feedback API for now)
    // ==========================================
    const repairMutation = useMutation({
        mutationFn: (data: { message: string; userName?: string; type: 'REPAIR_REQUEST' }) =>
            submitFeedback(data),
        onSuccess: () => {
            Alert.alert(
                "ส่งเรื่องแจ้งซ่อมสำเร็จ",
                "เราได้รับข้อมูลแล้ว ทีมงานจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด",
                [
                    {
                        text: "ตกลง",
                        onPress: () => {
                            setMessage("");
                            setSubject("");
                            // Invalidate and refetch after switching tab
                            queryClient.invalidateQueries({ queryKey: ["repairHistory"] });
                            setActiveTab(1); // Switch to history tab
                            // Force refetch after state update
                            setTimeout(() => refetchHistory(), 100);
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

    // Delete mutation for swipe-to-delete
    const deleteMutation = useMutation({
        mutationFn: deleteRepairRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repairHistory"] });
        },
        onError: (error: any) => {
            Logger.error("Error deleting repair request:", error);
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถลบรายการได้");
        },
    });

    // Handle delete with confirmation
    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            "ยืนยันการลบ",
            `ต้องการลบเรื่อง "${title}" หรือไม่?`,
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ลบ",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(id),
                },
            ]
        );
    };

    // Render swipe delete action
    const renderRightActions = (id: string, title: string) => {
        return (
            <TouchableOpacity
                onPress={() => handleDelete(id, title)}
                style={{
                    backgroundColor: "#EF4444",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 80,
                    borderRadius: 16,
                    marginLeft: 8,
                }}
            >
                <MaterialIcons name="delete" size={24} color="#FFFFFF" />
                <Text style={{ fontFamily: "Kanit", fontSize: 12, color: "#FFFFFF", marginTop: 4 }}>ลบ</Text>
            </TouchableOpacity>
        );
    };

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
        repairMutation.mutate({ message: fullMessage, userName, type: 'REPAIR_REQUEST' });
    };

    // ==========================================
    // 🖼️ LAYER: View (Header Component)
    // ==========================================
    const renderHeader = () => (
        <View style={{ backgroundColor: "#FFFFFF" }}>
            <ScreenHeader title="แจ้งปัญหา / ส่งซ่อม" onBack={() => router.back()} />
            <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
                <TabSelector
                    tabs={["แจ้งปัญหา", "ติดตามสถานะ"]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </View>
        </View>
    );

    // ==========================================
    // 🖼️ LAYER: View (Main Render)
    // Purpose: Render repair form
    // ==========================================
    return (
        <ScreenWrapper
            edges={["top", "left", "right"]}
            useScrollView={false}
            style={{ backgroundColor: "#FFFFFF" }}
            header={renderHeader()}
        >
            {/* Content ScrollView */}
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={150}
                extraHeight={150}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ paddingHorizontal: 24 }}>
                    {activeTab === 0 ? (
                        // FORM VIEW
                        <View style={{ gap: 20 }}>

                            {/* Subject Input */}
                            <View>
                                <Text className="font-kanit font-bold text-gray-700 mb-2 ml-1">หัวข้อปัญหา</Text>
                                <View style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: subjectFocused ? "#16AD78" : "#E5E7EB",
                                }}>
                                    <UserInput
                                        placeholder="เช่น เครื่องไม่เชื่อมต่อ, ไฟไม่ติด"
                                        value={subject}
                                        onChangeText={setSubject}
                                        onFocus={() => setSubjectFocused(true)}
                                        onBlur={() => setSubjectFocused(false)}
                                        style={{
                                            borderWidth: 0,
                                            backgroundColor: 'transparent',
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Description Input */}
                            <View>
                                <Text className="font-kanit font-bold text-gray-700 mb-2 ml-1">รายละเอียด</Text>
                                <View style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: messageFocused ? "#16AD78" : "#E5E7EB",
                                    minHeight: 150,
                                }}>
                                    <UserInput
                                        placeholder="อธิบายอาการที่พบให้เราทราบ..."
                                        value={message}
                                        onChangeText={setMessage}
                                        onFocus={() => setMessageFocused(true)}
                                        onBlur={() => setMessageFocused(false)}
                                        multiline
                                        maxLength={500}
                                        style={{
                                            height: 100,
                                            textAlignVertical: 'top',
                                            borderWidth: 0,
                                            backgroundColor: 'transparent',
                                            padding: 0,
                                        }}
                                    />
                                    <Text style={{
                                        fontFamily: "Kanit",
                                        fontSize: 12,
                                        color: "#9CA3AF",
                                        textAlign: "right",
                                        marginTop: 8
                                    }}>
                                        {message.length}/500
                                    </Text>
                                </View>
                            </View>

                            {/* Contact Info Preview */}
                            {userProfile && (
                                <View className="mt-2 flex-row items-center justify-center space-x-2 opacity-60">
                                    <MaterialIcons name="contact-support" size={16} color="#898989" />
                                    <Text className="font-kanit text-gray-500 text-xs">
                                        ติดต่อกลับ: {userProfile.firstName} {userProfile.lastName}
                                    </Text>
                                </View>
                            )}

                            <View className="h-4" />

                            <PrimaryButton
                                title="ส่งเรื่อง"
                                onPress={handleSubmit}
                                loading={repairMutation.isPending}
                                disabled={!message.trim() || !subject.trim()}
                            />
                        </View>
                    ) : (
                        // HISTORY VIEW
                        <View style={{ gap: 16 }}>
                            {isLoadingHistory ? (
                                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                                    <ActivityIndicator size="large" color="#EAB308" />
                                    <Text style={{ fontFamily: "Kanit", color: "#9CA3AF", marginTop: 16, textAlign: "center" }}>
                                        กำลังโหลดข้อมูล...
                                    </Text>
                                </View>
                            ) : historyError ? (
                                <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
                                    <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                                    <Text style={{ fontFamily: "Kanit", color: "#EF4444", marginTop: 16, textAlign: "center", fontWeight: "bold" }}>
                                        เกิดข้อผิดพลาด
                                    </Text>
                                    <Text style={{ fontFamily: "Kanit", color: "#6B7280", marginTop: 8, textAlign: "center", fontSize: 12 }}>
                                        {(historyError as any)?.message || "ไม่สามารถโหลดข้อมูลได้"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => refetchHistory()}
                                        style={{ marginTop: 16, backgroundColor: "#6B7280", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                                    >
                                        <Text style={{ fontFamily: "Kanit", fontWeight: "600", color: "#FFFFFF" }}>ลองใหม่</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : historyItems?.length === 0 ? (
                                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
                                    <View style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        backgroundColor: "#F3F4F6",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 16,
                                    }}>
                                        <MaterialIcons name="inbox" size={40} color="#9CA3AF" />
                                    </View>
                                    <Text style={{ fontFamily: "Kanit", fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                                        ยังไม่มีประวัติการแจ้งซ่อม
                                    </Text>
                                    <Text style={{ fontFamily: "Kanit", fontSize: 14, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 24 }}>
                                        เมื่อคุณแจ้งปัญหาหรือส่งซ่อม{"\n"}รายการจะแสดงที่นี่
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab(0)}
                                        style={{
                                            marginTop: 24,
                                            backgroundColor: "#16AD78",
                                            paddingHorizontal: 24,
                                            paddingVertical: 12,
                                            borderRadius: 12
                                        }}
                                    >
                                        <Text style={{ fontFamily: "Kanit", fontWeight: "600", color: "#FFFFFF" }}>
                                            แจ้งปัญหาใหม่
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                    {historyItems?.map((item) => {
                                        const topicMatch = item.message.match(/Topic: (.*?)\n/);
                                        const displayTitle = topicMatch ? topicMatch[1] : "แจ้งปัญหาทั่วไป";
                                        const isRepair = item.message.includes("[REPAIR REQUEST]");

                                        // Status styling based on all possible statuses
                                        const userPhone = userProfile?.phone ? ` (${userProfile.phone})` : '';
                                        const statusConfig: Record<string, { color: string; bg: string; text: string; barColor: string }> = {
                                            'PENDING': { color: '#B45309', bg: '#FEF3C7', text: 'รอรับเรื่อง', barColor: '#FBBF24' },
                                            'REVIEWED': { color: '#1D4ED8', bg: '#DBEAFE', text: `รับเรื่องแล้ว จะติดต่อกลับ${userPhone}`, barColor: '#3B82F6' },
                                            'RESOLVED': { color: '#15803D', bg: '#DCFCE7', text: 'ดำเนินการเสร็จสิ้น', barColor: '#22C55E' },
                                        };
                                        const status = statusConfig[item.status] || statusConfig['PENDING'];

                                        return (
                                            <View key={item.id} style={{ marginBottom: 12 }}>
                                                <Swipeable
                                                    ref={(ref) => {
                                                        if (ref) {
                                                            // Will set as current when opened
                                                        }
                                                    }}
                                                    renderRightActions={() => renderRightActions(item.id, displayTitle)}
                                                    overshootRight={false}
                                                    onSwipeableWillOpen={() => {
                                                        // Close previous swipeable before opening new one
                                                        if (openSwipeableRef.current) {
                                                            openSwipeableRef.current.close();
                                                        }
                                                    }}
                                                    onSwipeableOpen={(direction, swipeable) => {
                                                        // Track the currently open swipeable
                                                        openSwipeableRef.current = swipeable;
                                                    }}
                                                    onSwipeableClose={() => {
                                                        openSwipeableRef.current = null;
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            // Extract message content
                                                            const fullMessage = item.message.replace(/\[REPAIR REQUEST\] Topic: .*?\nDetails: /, "");
                                                            Alert.alert(
                                                                item.ticketNumber ? item.ticketNumber : displayTitle,
                                                                `หัวข้อ: ${displayTitle}\n\nรายละเอียด: ${fullMessage}\n\nสถานะ: ${status.text}\n\nวันที่แจ้ง: ${new Date(item.createdAt).toLocaleString('th-TH')}`,
                                                                [{ text: "ปิด", style: "cancel" }]
                                                            );
                                                        }}
                                                        activeOpacity={0.7}
                                                        style={{
                                                            backgroundColor: "#FFFFFF",
                                                            borderWidth: 1,
                                                            borderColor: "#F3F4F6",
                                                            padding: 16,
                                                            borderRadius: 16,
                                                            flexDirection: "row",
                                                            gap: 12,
                                                            shadowColor: "#000",
                                                            shadowOffset: { width: 0, height: 1 },
                                                            shadowOpacity: 0.05,
                                                            shadowRadius: 2,
                                                            elevation: 1,
                                                        }}
                                                    >
                                                        <View style={{ width: 4, borderRadius: 2, backgroundColor: status.barColor }} />
                                                        <View style={{ flex: 1 }}>
                                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                                <View style={{ flex: 1 }}>
                                                                    {item.ticketNumber && (
                                                                        <Text style={{ fontFamily: "Kanit", fontSize: 11, color: "#6366F1", fontWeight: "600", marginBottom: 2 }}>
                                                                            {item.ticketNumber}
                                                                        </Text>
                                                                    )}
                                                                    <Text style={{ fontFamily: "Kanit", fontWeight: "bold", color: "#1F2937", fontSize: 15, marginBottom: 4 }} numberOfLines={1}>
                                                                        {displayTitle}
                                                                    </Text>
                                                                </View>
                                                                <Text style={{ fontFamily: "Kanit", fontSize: 11, color: "#9CA3AF" }}>
                                                                    {new Date(item.createdAt).toLocaleDateString('th-TH')}
                                                                </Text>
                                                            </View>

                                                            <Text style={{ fontFamily: "Kanit", color: "#6B7280", fontSize: 13, marginBottom: 8 }} numberOfLines={2}>
                                                                {item.message.replace(/\[REPAIR REQUEST\] Topic: .*?\nDetails: /, "")}
                                                            </Text>

                                                            <View style={{ flexDirection: "row", gap: 8 }}>
                                                                <View style={{
                                                                    paddingHorizontal: 8,
                                                                    paddingVertical: 4,
                                                                    borderRadius: 6,
                                                                    backgroundColor: status.bg
                                                                }}>
                                                                    <Text style={{
                                                                        fontFamily: "Kanit",
                                                                        fontSize: 10,
                                                                        fontWeight: "bold",
                                                                        color: status.color
                                                                    }}>
                                                                        {status.text}
                                                                    </Text>
                                                                </View>
                                                                {isRepair && (
                                                                    <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                                        <Text style={{ fontFamily: "Kanit", fontSize: 10, color: "#6B7280" }}>ซ่อมบำรุง</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </Swipeable>
                                            </View>
                                        );
                                    })}
                                </GestureHandlerRootView>
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAwareScrollView>
        </ScreenWrapper>
    );
}
