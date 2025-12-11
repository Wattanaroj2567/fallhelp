import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const renderHeader = () => (
    <View style={{ backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title="ตั้งค่า WiFi" onBack={handleBack} />
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text
          style={{ fontSize: 20, fontWeight: "600", marginBottom: 8, marginTop: 8 }}
          className="font-kanit text-gray-900"
        >
          ตั้งค่าเครือข่าย WiFi สำหรับอุปกรณ์
        </Text>
        <Text
          style={{ fontSize: 14, marginBottom: 8 }}
          className="font-kanit text-gray-600"
        >
          กรุณากรอกชื่อ WiFi (SSID) และรหัสผ่านเพื่อเชื่อมต่ออุปกรณ์กับอินเทอร์เน็ต
        </Text>
      </View>
    </View>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // ==========================================
  return (
    <ScreenWrapper
      keyboardAvoiding={true}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1, paddingTop: 16 }}
      edges={["top", "left", "right"]}
      useScrollView={true}
      header={renderHeader()}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: "#FEF9C3",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#FDE68A",
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "600", marginBottom: 4 }}
            className="font-kanit text-yellow-800"
          >
            📝 หมายเหตุสำหรับ Production:
          </Text>
          <Text style={{ fontSize: 11 }} className="font-kanit text-yellow-700">
            • ต้องรองรับเฉพาะ WiFi 2.4GHz{"\n"}• ต้องเชื่อมต่อกับ ESP32 ผ่าน
            BLE/MQTT{"\n"}• แสดง loading จริงจนกว่า ESP32 จะตอบกลับ{"\n"}•
            Handle timeout และ error cases
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <FloatingLabelInput
            label="ชื่อ WiFi (SSID)"
            value={manualSsid}
            onChangeText={setManualSsid}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 24 }}>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
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
            }}
          >
            <ActivityIndicator size="large" color="#16AD78" />
            <Text
              style={{ fontSize: 16, marginTop: 16 }}
              className="text-gray-900 font-kanit"
            >
              กำลังเชื่อมต่อ WiFi กับอุปกรณ์...
            </Text>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
