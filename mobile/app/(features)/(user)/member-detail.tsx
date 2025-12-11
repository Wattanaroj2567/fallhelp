import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCurrentElder } from "@/hooks/useCurrentElder";
import Logger from "@/utils/logger";
import { removeMember, updateMemberAccess } from "@/services/elderService";

export default function MemberDetailScreen() {
    const router = useRouter();
    const { memberId, initialRole, memberName, memberEmail, memberImage } = useLocalSearchParams<{
        memberId: string;
        initialRole: 'OWNER' | 'EDITOR' | 'VIEWER';
        memberName: string;
        memberEmail: string;
        memberImage: string;
    }>();

    const queryClient = useQueryClient();
    const { data: currentElder } = useCurrentElder();

    // State for role selection
    const [selectedRole, setSelectedRole] = useState<'EDITOR' | 'VIEWER'>(
        initialRole === 'OWNER' ? 'VIEWER' : (initialRole as 'EDITOR' | 'VIEWER')
    );

    const isTargetOwner = initialRole === 'OWNER';

    // Mutation for updating access
    const updateMutation = useMutation({
        mutationFn: async (newRole: 'EDITOR' | 'VIEWER') => {
            if (!currentElder?.id || !memberId) return;
            await updateMemberAccess(currentElder.id, memberId, newRole);
        },
        onSuccess: (_, newRole) => {
            setSelectedRole(newRole);
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["userElders"] }); // In case it affects own access? No, it's for target.
            Alert.alert("สำเร็จ", "บันทึกสิทธิ์เรียบร้อยแล้ว");
        },
        onError: (error: any) => {
            Logger.error("Update access failed", error);
            Alert.alert("ผิดพลาด", "ไม่สามารถแก้ไขสิทธิ์ได้");
            // Revert local state if needed, but we set it on success
        }
    });

    // Mutation for deleting member
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!currentElder?.id || !memberId) return;
            await removeMember(currentElder.id, memberId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            Alert.alert("สำเร็จ", "ลบสมาชิกเรียบร้อยแล้ว", [
                { text: "ตกลง", onPress: () => router.back() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert("ผิดพลาด", error.message || "ไม่สามารถลบสมาชิกได้");
        }
    });

    const handleSave = () => {
        if (selectedRole === initialRole) {
            router.back();
            return;
        }
        updateMutation.mutate(selectedRole);
    };

    const handleDelete = () => {
        Alert.alert(
            "ยืนยันการลบ",
            `คุณต้องการลบ ${memberName || 'สมาชิกนี้'} ออกจากกลุ่มใช่หรือไม่?`,
            [
                { text: "ยกเลิก", style: "cancel" },
                { text: "ลบ", style: "destructive", onPress: () => deleteMutation.mutate() }
            ]
        );
    };

    return (
        <ScreenWrapper useScrollView={false} style={{ backgroundColor: "#F9FAFB" }}>
            <ScreenHeader title="รายละเอียดสมาชิก" onBack={() => router.back()} backgroundColor="#F9FAFB" />

            <View className="flex-1 px-6 pt-6">
                {/* User Card */}
                <View className="bg-white rounded-3xl p-6 items-center shadow-sm border border-gray-100 mb-6">
                    <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
                        {memberImage ? (
                            <Image source={{ uri: memberImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <MaterialIcons name="person" size={48} color="#9CA3AF" />
                        )}
                    </View>
                    <Text className="text-xl font-bold font-kanit text-gray-900 text-center">
                        {memberName || "ไม่ระบุชื่อ"}
                    </Text>
                    <Text className="text-base font-kanit text-gray-500 mt-1 text-center">
                        {memberEmail || "ไม่ระบุอีเมล"}
                    </Text>

                    {isTargetOwner && (
                        <View className="mt-3 px-3 py-1 bg-purple-100 rounded-full">
                            <Text className="text-purple-700 font-kanit text-sm font-medium">เจ้าของ (Owner)</Text>
                        </View>
                    )}
                </View>

                {/* Role Selection (Hide if target is Owner) */}
                {!isTargetOwner && (
                    <>
                        <Text className="text-lg font-bold font-kanit text-gray-800 mb-4">
                            กำหนดสิทธิ์การใช้งาน
                        </Text>

                        <TouchableOpacity
                            onPress={() => setSelectedRole('EDITOR')}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-2xl mb-3 border ${selectedRole === 'EDITOR'
                                ? "bg-teal-50 border-teal-200"
                                : "bg-white border-gray-100"
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${selectedRole === 'EDITOR' ? "bg-teal-100" : "bg-gray-50"
                                }`}>
                                <MaterialIcons name="edit" size={24} color={selectedRole === 'EDITOR' ? "#0F766E" : "#9CA3AF"} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold font-kanit text-base ${selectedRole === 'EDITOR' ? "text-teal-900" : "text-gray-900"
                                    }`}>
                                    แก้ไขได้
                                </Text>
                                <Text className="font-kanit text-sm text-gray-500 mt-0.5">
                                    สามารถแก้ไขข้อมูลส่วนตัว จัดการรายชื่อผู้ติดต่อฉุกเฉิน และตั้งค่าอุปกรณ์ได้
                                </Text>
                            </View>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedRole === 'EDITOR' ? "border-teal-500 bg-teal-500" : "border-gray-300 bg-transparent"
                                }`}>
                                {selectedRole === 'EDITOR' && <MaterialIcons name="check" size={16} color="white" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedRole('VIEWER')}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-2xl mb-8 border ${selectedRole === 'VIEWER'
                                ? "bg-orange-50 border-orange-200"
                                : "bg-white border-gray-100"
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${selectedRole === 'VIEWER' ? "bg-orange-100" : "bg-gray-50"
                                }`}>
                                <MaterialIcons name="visibility" size={24} color={selectedRole === 'VIEWER' ? "#C2410C" : "#9CA3AF"} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold font-kanit text-base ${selectedRole === 'VIEWER' ? "text-orange-900" : "text-gray-900"
                                    }`}>
                                    ดูอย่างเดียว
                                </Text>
                                <Text className="font-kanit text-sm text-gray-500 mt-0.5">
                                    ดูข้อมูลสุขภาพและความเป็นอยู่ได้เท่านั้น ไม่สามารถแก้ไขการตั้งค่าใดๆ
                                </Text>
                            </View>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedRole === 'VIEWER' ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-transparent"
                                }`}>
                                {selectedRole === 'VIEWER' && <MaterialIcons name="check" size={16} color="white" />}
                            </View>
                        </TouchableOpacity>

                        {/* Save Button */}
                        {selectedRole !== initialRole && (
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-[#16AD78] py-4 rounded-2xl mb-4 items-center shadow-sm shadow-green-200"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold font-kanit text-white text-lg">บันทึกการเปลี่ยนแปลง</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Delete Button */}
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-white border border-red-100 py-4 rounded-2xl items-center"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <ActivityIndicator color="#EF4444" />
                            ) : (
                                <Text className="font-bold font-kanit text-red-500 text-lg">ลบออกจากกลุ่มครอบครัว</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScreenWrapper>
    );
}
