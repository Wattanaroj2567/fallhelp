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

    if (!device) {
        return (
            <ScreenWrapper edges={["top"]} style={{ backgroundColor: "#FDFDFD" }}>
                <View className="px-6 py-4 flex-row items-center gap-4 border-b border-gray-100 bg-white">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-kanit font-bold text-gray-800">
                        ข้อมูลอุปกรณ์
                    </Text>
                </View>
                <View className="flex-1 items-center justify-center p-6">
                    <MaterialIcons name="devices-other" size={64} color="#9CA3AF" />
                    <Text className="font-kanit text-gray-500 mt-4 text-center">
                        ไม่พบข้อมูลอุปกรณ์ที่เชื่อมต่อ
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace("/(features)/(device)/pairing")}
                        className="mt-6 bg-[#16AD78] px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-kanit font-bold">จับคู่อุปกรณ์ใหม่</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper edges={["top", "left", "right"]} style={{ backgroundColor: "#FFFFFF" }} useScrollView={false}>
            <ScreenHeader title="การตั้งค่าอุปกรณ์" onBack={() => router.back()} />

            <View className="flex-1 p-6">
                {/* Device Info Card (Featured) */}
                <View className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8 items-center relative overflow-hidden">
                    <View className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-400 to-teal-400 opacity-50" />

                    <View className={`w-24 h-24 rounded-full items-center justify-center mb-5 shadow-sm ${device.status === 'ACTIVE' ? 'bg-green-50 border-4 border-white shadow-green-100' : 'bg-gray-50 border-4 border-white'
                        }`}>
                        <MaterialIcons
                            name="devices"
                            size={48}
                            color={device.status === 'ACTIVE' ? '#16AD78' : '#9CA3AF'}
                        />
                        {device.status === 'ACTIVE' && (
                            <View className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
                        )}
                    </View>

                    <Text className="text-3xl font-kanit font-bold text-gray-800 mb-2 tracking-tight">
                        {device.deviceCode}
                    </Text>

                    <View className={`px-4 py-1.5 rounded-full mb-8 ${device.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        <Text className={`text-sm font-kanit font-bold ${device.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'
                            }`}>
                            {device.status === 'ACTIVE' ? '● ออนไลน์' : '○ ออฟไลน์'}
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
                </View>

                {/* Action Buttons Group */}
                <Text className="text-lg font-kanit font-bold text-gray-800 mb-4 ml-2">
                    การจัดการ
                </Text>

                <View className="gap-4">
                    <TouchableOpacity
                        onPress={() => router.push("/(features)/(device)/repair")}
                        className="bg-white p-5 rounded-2xl border border-yellow-50 shadow-sm flex-row items-center justify-between active:bg-yellow-50 active:scale-[0.99] transition-all"
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
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between active:bg-gray-50 active:scale-[0.99] transition-all"
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

                    <TouchableOpacity
                        onPress={handleUnpair}
                        className="bg-white p-5 rounded-2xl border border-red-50 shadow-sm flex-row items-center justify-between active:bg-red-50 active:scale-[0.99] transition-all"
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
                </View>
            </View>
        </ScreenWrapper>
    );
}
