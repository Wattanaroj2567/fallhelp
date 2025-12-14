import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";

import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { configureWifi } from "@/services/deviceService";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import Logger from "@/utils/logger";
import { showErrorMessage } from "@/utils/errorHelper";
import { PrimaryButton } from "@/components/PrimaryButton";

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
    onError: (error: unknown) => {
      Logger.error("Error configuring WiFi:", error);
      showErrorMessage("ข้อผิดพลาด", error);
    },
  });

  const handleConnect = () => {
    if (!manualSsid.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อ WiFi (SSID)");
      return;
    }

    // Validate password: empty (open network) or 8+ chars (WPA2)
    if (manualPassword.length > 0 && manualPassword.length < 8) {
      Alert.alert(
        "รหัสผ่านไม่ถูกต้อง",
        "รหัสผ่าน WiFi ต้องมีอย่างน้อย 8 ตัวอักษร\n(หรือเว้นว่างถ้าไม่มีรหัส)"
      );
      return;
    }

    configureWifiMutation.mutate({
      ssid: manualSsid.trim(),
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
      useScrollView={false}
      header={<ScreenHeader title="" onBack={handleBack} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          ตั้งค่า WiFi
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          เปลี่ยน WiFi หรือตั้งค่าใหม่
          {deviceCode ? ` (${deviceCode})` : ""}
        </Text>

        {/* Form Inputs */}
        <View>
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

        {/* Action Button */}
        <View>
          <PrimaryButton
            title="เชื่อมต่อ"
            onPress={handleConnect}
            loading={configureWifiMutation.isPending}
            icon={<MaterialIcons name="arrow-forward" size={20} color="white" />}
          />
        </View>

        {/* Info: How it works */}
        <View className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <Text className="font-kanit text-blue-800 font-semibold mb-2">
            วิธีการทำงาน
          </Text>
          <Text className="font-kanit text-blue-700 text-sm leading-5">
            • อุปกรณ์ต้องเชื่อมต่อ WiFi และอินเทอร์เน็ตอยู่{"\n"}
            • เมื่อกด "เชื่อมต่อ" ข้อมูลจะส่งผ่าน Server{"\n"}
            • อุปกรณ์จะรีสตาร์ทและเชื่อมต่อ WiFi ใหม่
          </Text>
        </View>

        {/* Offline Device Section */}
        <View className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="help-circle" size={18} color="#B45309" />
            <Text className="font-kanit text-amber-800 font-semibold ml-2">
              อุปกรณ์ไม่ได้เชื่อมต่อ?
            </Text>
          </View>
          <Text className="font-kanit text-amber-700 text-sm mb-3 leading-5">
            หากอุปกรณ์ offline หรือย้ายไปสถานที่ใหม่{"\n"}
            อุปกรณ์จะเปิด WiFi "FallHelp-DAF380" ให้ตั้งค่าใหม่
          </Text>
          <TouchableOpacity
            className="bg-amber-500 rounded-xl py-3 flex-row items-center justify-center"
            onPress={() => {
              Alert.alert(
                "วิธีตั้งค่า WiFi ใหม่",
                "1. ปัดจอลงมาจากมุมขวาบน\n\n" +
                "2. กดค้างที่ไอคอน WiFi\n\n" +
                "3. เลือก \"FallHelp-DAF380\"\n\n" +
                "4. หน้าตั้งค่าจะเปิดอัตโนมัติ\n\n" +
                "5. กรอกข้อมูล WiFi ใหม่",
                [{ text: "เข้าใจแล้ว" }]
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle" size={20} color="white" />
            <Text className="font-kanit font-semibold text-white ml-2">
              ดูวิธีตั้งค่าใหม่
            </Text>
          </TouchableOpacity>
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
