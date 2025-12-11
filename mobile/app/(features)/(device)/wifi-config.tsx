import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { configureWifi } from "@/services/deviceService";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import Logger from "@/utils/logger";

// ==========================================
// 📱 LAYER: View (Screen)
// Purpose: WiFi Configuration Screen (Re-config)
// ==========================================
export default function WifiConfig() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const deviceCode = params.deviceCode as string;

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // ==========================================
  const [manualSsid, setManualSsid] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // ==========================================
  const configureWifiMutation = useMutation({
    mutationFn: async (payload: { ssid: string; wifiPassword: string }) => {
      if (!deviceCode) {
        throw new Error("ไม่พบข้อมูลอุปกรณ์ กรุณาลองใหม่อีกครั้ง");
      }

      return await configureWifi(deviceCode, {
        ssid: payload.ssid,
        wifiPassword: payload.wifiPassword,
      });
    },
    onSuccess: () => {
      Alert.alert("สำเร็จ", "ส่งข้อมูลการตั้งค่า WiFi ไปยังอุปกรณ์แล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Logger.error("Error configuring WiFi:", error);
      Alert.alert("ข้อผิดพลาด", error.message || "ไม่สามารถเชื่อมต่อ WiFi ได้");
    },
  });

  const handleConnect = () => {
    if (!manualSsid.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อ WiFi (SSID)");
      return;
    }

    configureWifiMutation.mutate({
      ssid: manualSsid,
      wifiPassword: manualPassword,
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/settings");
    }
  };

  return (
    <ScreenWrapper
      keyboardAvoiding={true}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      edges={["top", "left", "right"]}
      useScrollView={false}
    >
      <ScreenHeader title="ตั้งค่า WiFi" onBack={handleBack} />
      <View className="flex-1 px-6">
        {/* Title */}
        <Text
          style={{ fontSize: 20, fontWeight: "600" }}
          className="font-kanit text-gray-900 mb-2 mt-4"
        >
          ตั้งค่าเครือข่าย WiFi สำหรับอุปกรณ์
        </Text>
        <Text
          style={{ fontSize: 14 }}
          className="font-kanit text-gray-600 mb-6"
        >
          กรุณากรอกชื่อ WiFi (SSID)
          และรหัสผ่านเพื่อเชื่อมต่ออุปกรณ์กับอินเทอร์เน็ต
        </Text>

        <View className="bg-yellow-50 rounded-2xl p-4 mb-6 border border-yellow-200">
          <Text
            style={{ fontSize: 12, fontWeight: "600" }}
            className="font-kanit text-yellow-800 mb-1"
          >
            📝 หมายเหตุสำหรับ Production:
          </Text>
          <Text style={{ fontSize: 11 }} className="font-kanit text-yellow-700">
            • ต้องรองรับเฉพาะ WiFi 2.4GHz{"\n"}• ต้องเชื่อมต่อกับ ESP32 ผ่าน
            BLE/MQTT{"\n"}• แสดง loading จริงจนกว่า ESP32 จะตอบกลับ{"\n"}•
            Handle timeout และ error cases
          </Text>
        </View>

        <View className="mb-4">
          <FloatingLabelInput
            label="ชื่อ WiFi (SSID)"
            value={manualSsid}
            onChangeText={setManualSsid}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <FloatingLabelInput
            label="รหัสผ่าน WiFi"
            value={manualPassword}
            onChangeText={setManualPassword}
            isPassword
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        <PrimaryButton
          title="เชื่อมต่อ"
          onPress={handleConnect}
          loading={configureWifiMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>

      <Modal visible={configureWifiMutation.isPending} transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 items-center">
            <ActivityIndicator size="large" color="#16AD78" />
            <Text
              style={{ fontSize: 16 }}
              className="text-gray-900 mt-4 font-kanit"
            >
              กำลังเชื่อมต่อ WiFi กับอุปกรณ์...
            </Text>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
