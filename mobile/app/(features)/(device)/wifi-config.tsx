import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  const params = useLocalSearchParams();
  const deviceCode = params.deviceCode as string;
  const from = params.from as string;

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
          onPress: () => {
            if (from === "pairing") {
              router.replace("/(features)/(device)/details");
            } else {
              router.back();
            }
          },
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
    if (from === "pairing") {
      router.replace("/(features)/(device)/details");
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(features)/(device)/details");
      }
    }
  };

  // ==========================================
  // 🖼️ LAYER: View (Header Component)
  // ==========================================
  // Keep header simpler - just the nav bar
  // The content will be in the main scroll view
  
  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // ==========================================
  return (
    <ScreenWrapper
      keyboardAvoiding={true}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
      edges={["top", "left", "right"]}
      useScrollView={true}
      header={
        <View style={{ backgroundColor: "#FFFFFF" }}>
          <ScreenHeader title="ตั้งค่า WiFi" onBack={handleBack} />
          <View className="items-center pb-6 px-6 border-b border-gray-50">
            <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center mb-3 border border-green-100">
              <MaterialIcons name="wifi" size={32} color="#16AD78" />
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: "600" }}
              className="font-kanit text-gray-900 text-center mb-1"
            >
              เชื่อมต่อ WiFi
            </Text>
            <Text
              style={{ fontSize: 13, lineHeight: 20 }}
              className="font-kanit text-gray-500 text-center px-4"
            >
              กรุณากรอกชื่อ WiFi (SSID) และรหัสผ่าน
              {deviceCode ? ` สำหรับอุปกรณ์ ${deviceCode}` : ""}
            </Text>
          </View>
        </View>
      }
    >
      <View className="flex-1 pt-6">
        {/* Form Inputs */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <View className="mb-5">
            <FloatingLabelInput
              label="ชื่อ WiFi (SSID)"
              value={manualSsid}
              onChangeText={setManualSsid}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View>
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
        </View>

        {/* Action Button */}
        <View className="mt-2">
          <PrimaryButton
            title="เชื่อมต่อ"
            onPress={handleConnect}
            loading={configureWifiMutation.isPending}
            icon={<MaterialIcons name="arrow-forward" size={20} color="white" />}
          />
        </View>
      </View>

      {/* Loading Modal */}
      <Modal visible={configureWifiMutation.isPending} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
              width: '80%',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <ActivityIndicator size="large" color="#16AD78" />
            <Text
              style={{ fontSize: 18, fontWeight: "600", marginTop: 24, marginBottom: 8 }}
              className="text-gray-900 font-kanit text-center"
            >
              กำลังเชื่อมต่อ...
            </Text>
            <Text
              style={{ fontSize: 14 }}
              className="text-gray-500 font-kanit text-center"
            >
              กำลังส่งข้อมูล WiFi ไปยังอุปกรณ์
            </Text>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
