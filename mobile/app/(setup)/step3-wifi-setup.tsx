import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { configureWifi } from "@/services/deviceService";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { WizardLayout } from "@/components/WizardLayout";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 3 of Setup - WiFi Configuration
// ==========================================
export default function Step3() {
  const router = useRouter();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage WiFi connection state
  // ==========================================
  const [manualSsid, setManualSsid] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Configure WiFi for the device
  // ==========================================



  const configureWifiMutation = useMutation({
    mutationFn: async (payload: { ssid: string; wifiPassword: string }) => {
      const deviceId = await SecureStore.getItemAsync("setup_deviceId");
      if (!deviceId)
        throw new Error("ไม่พบข้อมูลอุปกรณ์ กรุณากลับไปทำขั้นตอนที่ 2 ใหม่");

      // Call Real API
      await configureWifi(deviceId, payload);
      
      Logger.info("WiFi Config Success:", {
        deviceId,
        ssid: payload.ssid,
      });

      return { success: true };
    },
    onSuccess: async () => {
      // Clear all setup data
      try {
        await SecureStore.deleteItemAsync("setup_step");
        await SecureStore.deleteItemAsync("setup_elderId");
        await SecureStore.deleteItemAsync("setup_deviceId");
        await AsyncStorage.removeItem("setup_step1_form_data");

        router.replace("/(setup)/saved-success");
      } catch (err) {
        Logger.error("Error clearing setup data:", err);
        // Even if clearing fails, try to proceed
        router.replace("/(setup)/saved-success");
      }
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

    // ส่งข้อมูล WiFi Config ไปที่ Backend เพื่อส่งต่อให้ ESP32
    configureWifiMutation.mutate({
      ssid: manualSsid,
      wifiPassword: manualPassword,
    });
  };

  const handleBack = async () => {
    // Just downgrade step - keep device paired
    // User can change device by going back again from Step 2
    await SecureStore.setItemAsync("setup_step", "2");

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(setup)/step2-device-pairing");
    }
  };

  const handleChangeDevice = async () => {
    Alert.alert(
      "เปลี่ยนอุปกรณ์",
      "ต้องการยกเลิกการผูกอุปกรณ์ปัจจุบันและเลือกอุปกรณ์ใหม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "เปลี่ยนอุปกรณ์",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("setup_deviceId");
            await SecureStore.setItemAsync("setup_step", "2");
            router.replace("/(setup)/step2-device-pairing");
          },
        },
      ]
    );
  };

  const handleBackToStep1 = async () => {
    Alert.alert(
      "กลับไปแก้ไขข้อมูลผู้สูงอายุ",
      "คุณสามารถแก้ไขข้อมูลผู้สูงอายุและกลับมาขั้นตอนนี้ได้ (ข้อมูลอุปกรณ์จะไม่หาย)",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "กลับไป Step 1",
          onPress: async () => {
            await SecureStore.setItemAsync("setup_step", "1");
            router.replace("/(setup)/step1-elder-info");
          },
        },
      ]
    );
  };

  return (
    <WizardLayout
      currentStep={3}
      title="ตั้งค่า WiFi"
      onBack={handleBack}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
    >
      <View className="flex-1 mt-4">
        {/* Title inside Card or above? Usually WizardLayout title is enough.
            But here we have extra instructions. Let's put instructions in the Card or just above.
            The user wants "Card Style" for form.
        */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text
            style={{ fontSize: 18, fontWeight: "600" }}
            className="font-kanit text-gray-900 mb-4"
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

          <View>
            <FloatingLabelInput
              label="ชื่อ WiFi (SSID)"
              value={manualSsid}
              onChangeText={setManualSsid}
              autoCorrect={false}
              autoCapitalize="none"
              // Remove leftIcon prop if it was there, but here it wasn't.
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
    </WizardLayout>
  );
}
