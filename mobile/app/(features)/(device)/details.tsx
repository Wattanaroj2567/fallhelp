import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserElders } from "@/services/userService";
import { ScreenHeader } from "@/components/ScreenHeader";
import { unpairDevice } from "@/services/deviceService";

export default function DeviceDetails() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch Elder & Device Data
    const { data: elderInfo, isLoading } = useQuery({
        queryKey: ["userElders"],
        queryFn: async () => {
            const elders = await getUserElders();
            return elders && elders.length > 0 ? elders[0] : null;
        },
    });

    const device = elderInfo?.device;
    const isReadOnly = elderInfo?.accessLevel === 'VIEWER';

    // Unpair Mutation
    const unpairMutation = useMutation({
        mutationFn: async (deviceId: string) => {
            return await unpairDevice({ deviceId });
        },
        onSuccess: () => {
            Alert.alert("สำเร็จ", "ยกเลิกการเชื่อมต่ออุปกรณ์เรียบร้อยแล้ว");
            queryClient.invalidateQueries({ queryKey: ["userElders"] });
            router.replace("/(tabs)");
        },
        onError: (error: any) => {
            Alert.alert(
                "เกิดข้อผิดพลาด",
                error.message || "ไม่สามารถยกเลิกการเชื่อมต่อได้"
            );
        },
    });

    const handleUnpair = () => {
        if (!device?.id) return;

        Alert.alert(
            "ยืนยันการยกเลิกเชื่อมต่อ",
            "คุณแน่ใจหรือไม่ที่จะยกเลิกการเชื่อมต่ออุปกรณ์นี้? คุณจะต้องทำการจับคู่ใหม่หากต้องการใช้งานอีกครั้ง",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    style: "destructive",
                    onPress: () => unpairMutation.mutate(device.id),
                },
            ]
        );
    };

    const handleWifiConfig = () => {
        if (!device?.deviceCode) return;
        router.push({
            pathname: "/(features)/(device)/wifi-config",
            params: { deviceCode: device.deviceCode },
        });
    };

    if (isLoading) {
        return (
            <ScreenWrapper edges={["top"]} style={{ backgroundColor: "#FDFDFD" }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#16AD78" />
                </View>
            </ScreenWrapper>
        );
    }

    // Determine device state for 3-color scheme
    const hasDevice = !!device;
    const isOnline = device?.status === 'ACTIVE';

    // Color scheme based on state
    const getStateColors = () => {
        if (!hasDevice) {
            return {
                iconBg: 'bg-gray-100 border-4 border-white',
                iconColor: '#9CA3AF',
                badgeBg: 'bg-gray-100',
                badgeText: 'text-gray-500',
                statusDot: 'bg-gray-400',
                gradientOpacity: 'opacity-30',
            };
        }
        if (isOnline) {
            return {
                iconBg: 'bg-green-50 border-4 border-white shadow-green-100',
                iconColor: '#16AD78',
                badgeBg: 'bg-green-100',
                badgeText: 'text-green-700',
                statusDot: 'bg-green-500',
                gradientOpacity: 'opacity-50',
            };
        }
        return {
            iconBg: 'bg-red-50 border-4 border-white shadow-red-100',
            iconColor: '#EF4444',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-600',
            statusDot: 'bg-red-500',
            gradientOpacity: 'opacity-50',
        };
    };

    const colors = getStateColors();

    return (
        <ScreenWrapper edges={["top", "left", "right"]} style={{ backgroundColor: "#FFFFFF" }} useScrollView={false}>
            <ScreenHeader title="การตั้งค่าอุปกรณ์" onBack={() => router.back()} />

            <View className="flex-1 p-6">
                {/* View Only Warning - Only show if has actions or no device */}
                {isReadOnly && (
                    <View className="bg-yellow-50 rounded-2xl p-4 mb-4 border border-yellow-100 flex-row items-center">
                        <MaterialIcons name="lock" size={20} color="#CA8A04" style={{ marginRight: 8 }} />
                        <Text className="font-kanit text-yellow-700 flex-1" style={{ fontSize: 13 }}>
                            โหมดดูได้อย่างเดียว: ไม่สามารถจัดการการเชื่อมต่ออุปกรณ์ได้
                        </Text>
                    </View>
                )}

                {/* Device Info Card (Featured) - Unified for all states */}
                <View className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8 items-center relative overflow-hidden">
                    <View className={`absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-400 to-teal-400 ${colors.gradientOpacity}`} />

                    <View className={`w-24 h-24 rounded-full items-center justify-center mb-5 shadow-sm ${colors.iconBg}`}>
                        <MaterialIcons
                            name={hasDevice ? "devices" : "devices-other"}
                            size={48}
                            color={colors.iconColor}
                        />
                        {hasDevice && (
                            <View className={`absolute top-0 right-0 w-6 h-6 ${colors.statusDot} rounded-full border-4 border-white`} />
                        )}
                    </View>

                    {hasDevice ? (
                        <>
                            <Text className="text-3xl font-kanit font-bold text-gray-800 mb-2 tracking-tight">
                                {device.deviceCode}
                            </Text>

                            <View className={`px-4 py-1.5 rounded-full mb-8 ${colors.badgeBg}`}>
                                <Text className={`text-sm font-kanit font-bold ${colors.badgeText}`}>
                                    {isOnline ? '● ออนไลน์' : '● ออฟไลน์'}
                                </Text>
                            </View>

                            <View className="w-full h-[1px] bg-gray-100 mb-6" />

                            <View className="w-full flex-row justify-between px-4">
                                <View className="items-center flex-1">
                                    <Text className="text-gray-400 font-kanit text-xs mb-1 uppercase tracking-wider">Serial Number</Text>
                                    <Text className="text-gray-800 font-kanit font-semibold text-sm text-center">
                                        {device.serialNumber || "-"}
                                    </Text>
                                </View>
                                <View className="w-[1px] bg-gray-100 h-full mx-4" />
                                <View className="items-center flex-1">
                                    <Text className="text-gray-400 font-kanit text-xs mb-1 uppercase tracking-wider">Firmware</Text>
                                    <Text className="text-gray-800 font-kanit font-semibold text-sm">
                                        {device.firmwareVersion || "1.0.0"}
                                    </Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text className="text-xl font-kanit font-bold text-gray-800 mb-2 text-center">
                                ยังไม่ได้ผูกอุปกรณ์
                            </Text>

                            <Text className="text-sm font-kanit text-gray-500 mb-6 text-center px-4">
                                {isReadOnly
                                    ? "ยังไม่มีการเชื่อมต่ออุปกรณ์ในระบบ"
                                    : "สแกน QR Code บนอุปกรณ์เพื่อเริ่มใช้งานระบบตรวจจับการล้ม"}
                            </Text>

                            {!isReadOnly && (
                                <TouchableOpacity
                                    onPress={() => router.push("/(features)/(device)/pairing")}
                                    className="bg-[#16AD78] px-8 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm"
                                    style={{ shadowColor: '#16AD78', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                                >
                                    <MaterialIcons name="qr-code-scanner" size={20} color="#FFFFFF" />
                                    <Text className="text-white font-kanit font-bold text-base">จับคู่อุปกรณ์</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Action Buttons Group - Only show when device exists */}
                {hasDevice && (
                    <>
                        <Text className="text-lg font-kanit font-bold text-gray-800 mb-4 ml-2">
                            การจัดการ
                        </Text>

                        <View className="gap-4">
                            <TouchableOpacity
                                onPress={() => router.push("/(features)/(device)/repair")}
                                className="bg-white p-5 rounded-2xl border border-yellow-50 shadow-sm flex-row items-center justify-between active:bg-yellow-50 active:scale-[0.99]"
                            >
                                <View className="flex-row items-center gap-4 flex-1">
                                    <View className="w-12 h-12 rounded-full bg-yellow-50 items-center justify-center shrink-0">
                                        <MaterialIcons name="build" size={24} color="#EAB308" />
                                    </View>
                                    <View className="flex-1 pr-2">
                                        <Text className="font-kanit font-bold text-gray-800 text-lg" numberOfLines={1}>แจ้งปัญหา / ส่งซ่อม</Text>
                                        <Text className="font-kanit text-gray-400 text-xs" numberOfLines={1}>แจ้งอุปกรณ์ชำรุดหรือขอความช่วยเหลือ</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleWifiConfig}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between active:bg-gray-50 active:scale-[0.99]"
                            >
                                <View className="flex-row items-center gap-4 flex-1">
                                    <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center shrink-0">
                                        <MaterialIcons name="wifi" size={24} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1 pr-2">
                                        <Text className="font-kanit font-bold text-gray-800 text-lg" numberOfLines={1}>ตั้งค่า Wi-Fi</Text>
                                        <Text className="font-kanit text-gray-400 text-xs" numberOfLines={1}>แก้ไขการเชื่อมต่อเครือข่าย</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                            </TouchableOpacity>

                            {/* Unpair Button - Only for Owner */}
                            {!isReadOnly && (
                                <TouchableOpacity
                                    onPress={handleUnpair}
                                    className="bg-white p-5 rounded-2xl border border-red-50 shadow-sm flex-row items-center justify-between active:bg-red-50 active:scale-[0.99]"
                                >
                                    <View className="flex-row items-center gap-4 flex-1">
                                        <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center shrink-0">
                                            <MaterialIcons name="link-off" size={24} color="#EF4444" />
                                        </View>
                                        <View className="flex-1 pr-2">
                                            <Text className="font-kanit font-bold text-red-500 text-lg" numberOfLines={1}>ยกเลิกการเชื่อมต่อ</Text>
                                            <Text className="font-kanit text-red-300 text-xs" numberOfLines={1}>ลบอุปกรณ์ออกจากบัญชี</Text>
                                        </View>
                                    </View>
                                    {unpairMutation.isPending ? (
                                        <ActivityIndicator size="small" color="#EF4444" />
                                    ) : (
                                        <MaterialIcons name="chevron-right" size={24} color="#FCA5A5" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </View>
        </ScreenWrapper>
    );
}
