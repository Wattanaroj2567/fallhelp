import React, { useState } from "react";
import { View, Text, TouchableOpacity, TouchableHighlight, Alert, Image, ActivityIndicator } from "react-native";
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
        <ScreenWrapper
            edges={["top", "left", "right"]}
            useScrollView={false}
            style={{ backgroundColor: "#F9FAFB" }}
        >
            <ScreenHeader
                title="รายละเอียดสมาชิก"
                onBack={() => router.back()}
                backgroundColor="#F9FAFB"
            />

            <View className="flex-1 px-6 pt-6">
                {/* User Card */}
                <View className="bg-white rounded-[32px] border border-gray-100 p-8 items-center relative shadow-sm mb-8">
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
                        <Text className="text-base font-bold font-kanit text-gray-700 mb-3 ml-2">
                            กำหนดสิทธิ์การใช้งาน
                        </Text>

                        {/* Role Selection Card */}
                        <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm mb-6">
                            {/* Editor Option */}
                            <TouchableHighlight
                                onPress={() => setSelectedRole('EDITOR')}
                                className={`border-b border-gray-100 ${selectedRole === 'EDITOR' ? "bg-teal-50" : "bg-white"}`}
                                underlayColor={selectedRole === 'EDITOR' ? "#CCFBF1" : "#E5E7EB"}
                            >
                                <View className="flex-row items-center p-5">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selectedRole === 'EDITOR' ? "bg-teal-100" : "bg-gray-50"}`}>
                                        <MaterialIcons name="edit" size={22} color={selectedRole === 'EDITOR' ? "#0F766E" : "#6B7280"} />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontSize: 16, fontWeight: "500" }} className={`font-kanit ${selectedRole === 'EDITOR' ? "text-teal-900" : "text-gray-900"}`}>
                                            แก้ไขได้
                                        </Text>
                                        <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500">
                                            แก้ไขข้อมูล จัดการผู้ติดต่อฉุกเฉิน และตั้งค่าอุปกรณ์
                                        </Text>
                                    </View>
                                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedRole === 'EDITOR' ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                                        {selectedRole === 'EDITOR' && <MaterialIcons name="check" size={14} color="white" />}
                                    </View>
                                </View>
                            </TouchableHighlight>

                            {/* Viewer Option */}
                            <TouchableHighlight
                                onPress={() => setSelectedRole('VIEWER')}
                                className={selectedRole === 'VIEWER' ? "bg-orange-50" : "bg-white"}
                                underlayColor={selectedRole === 'VIEWER' ? "#FFEDD5" : "#E5E7EB"}
                            >
                                <View className="flex-row items-center p-5">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selectedRole === 'VIEWER' ? "bg-orange-100" : "bg-gray-50"}`}>
                                        <MaterialIcons name="visibility" size={22} color={selectedRole === 'VIEWER' ? "#C2410C" : "#6B7280"} />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontSize: 16, fontWeight: "500" }} className={`font-kanit ${selectedRole === 'VIEWER' ? "text-orange-900" : "text-gray-900"}`}>
                                            ดูอย่างเดียว
                                        </Text>
                                        <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500">
                                            ดูข้อมูลได้เท่านั้น ไม่สามารถแก้ไขการตั้งค่าใดๆ
                                        </Text>
                                    </View>
                                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedRole === 'VIEWER' ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                                        {selectedRole === 'VIEWER' && <MaterialIcons name="check" size={14} color="white" />}
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>

                        {/* Action Buttons Card */}
                        <Text className="text-base font-bold font-kanit text-gray-700 mb-3 ml-2">
                            การจัดการ
                        </Text>
                        <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
                            {/* Save Button - Only show if role changed */}
                            {selectedRole !== initialRole && (
                                <TouchableHighlight
                                    onPress={handleSave}
                                    className="border-b border-gray-100 bg-green-50"
                                    underlayColor="#DCFCE7"
                                    disabled={updateMutation.isPending}
                                >
                                    <View className="flex-row items-center p-5">
                                        <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-green-100">
                                            <MaterialIcons name="save" size={22} color="#16AD78" />
                                        </View>
                                        <Text style={{ fontSize: 16, fontWeight: "500" }} className="font-kanit text-green-700 flex-1">
                                            {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                        </Text>
                                        {updateMutation.isPending ? (
                                            <ActivityIndicator size="small" color="#16AD78" />
                                        ) : (
                                            <MaterialIcons name="chevron-right" size={24} color="#86EFAC" />
                                        )}
                                    </View>
                                </TouchableHighlight>
                            )}

                            {/* Delete Button */}
                            <TouchableHighlight
                                onPress={handleDelete}
                                className="bg-white"
                                underlayColor="#FEF2F2"
                                disabled={deleteMutation.isPending}
                            >
                                <View className="flex-row items-center p-5">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-red-50">
                                        <MaterialIcons name="person-remove" size={22} color="#EF4444" />
                                    </View>
                                    <Text style={{ fontSize: 16, fontWeight: "500" }} className="font-kanit text-red-500 flex-1">
                                        {deleteMutation.isPending ? "กำลังลบ..." : "ลบออกจากกลุ่มครอบครัว"}
                                    </Text>
                                    {deleteMutation.isPending ? (
                                        <ActivityIndicator size="small" color="#EF4444" />
                                    ) : (
                                        <MaterialIcons name="chevron-right" size={24} color="#FCA5A5" />
                                    )}
                                </View>
                            </TouchableHighlight>
                        </View>
                    </>
                )}
            </View>
        </ScreenWrapper>
    );
}
