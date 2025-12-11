import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { configureWifi } from "@/services/deviceService";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 3 of Setup - WiFi Configuration
// ==========================================
export default function Step3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  // 🚧 TODO: ข้อมูลปลอมชั่วคราว - ใช้เพื่อทดสอบ flow เท่านั้น
  // เมื่อใช้งานจริง ต้องเปลี่ยนเป็น:
  // 1. เรียก API configureWifi() จริง ไปที่ backend
  // 2. Backend ส่งคำสั่งไปที่อุปกรณ์ ESP32 ผ่าน MQTT/WebSocket
  // 3. ESP32 connect WiFi ตาม SSID/Password ที่ส่งมา
  // 4. ESP32 ส่ง response กลับว่า connect สำเร็จหรือไม่
  // 5. ถ้าสำเร็จ → บันทึก wifiSsid ลง Device table
  // 6. ถ้าล้มเหลว → แสดง error ให้ user ลองใหม่

  const configureWifiMutation = useMutation({
    mutationFn: async (payload: { ssid: string; wifiPassword: string }) => {
      const deviceId = await SecureStore.getItemAsync("setup_deviceId");
      if (!deviceId)
        throw new Error("ไม่พบข้อมูลอุปกรณ์ กรุณากลับไปทำขั้นตอนที่ 2 ใหม่");

      // 🚧 MOCK: ข้ามการเรียก API จริง - ใช้ delay แทน
      // await configureWifi(deviceId, payload);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock delay 2 วินาที

      // 🚧 MOCK: สมมติว่า WiFi config สำเร็จเสมอ
      Logger.info("🚧 MOCK WiFi Config Success:", {
        deviceId,
        ssid: payload.ssid,
      });

      return { success: true };
    },
    onSuccess: async () => {
      // Clear all setup data
      await SecureStore.deleteItemAsync("setup_step");
      await SecureStore.deleteItemAsync("setup_elderId");
      await SecureStore.deleteItemAsync("setup_deviceId");
      await AsyncStorage.removeItem("setup_step1_form_data");

      router.replace("/(setup)/saved-success");
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

    // 🚧 MOCK: ยอมรับ SSID/Password อะไรก็ได้ในช่วงทดสอบ
    // เมื่อใช้งานจริง จะมี validation และส่งไปที่ ESP32 จริง
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
    <ScreenWrapper
      keyboardAvoiding={true}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      edges={["top", "left", "right"]}
      header={
        <View className="bg-white rounded-b-[32px] overflow-hidden pb-4 mb-4 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
              <Ionicons name="chevron-back" size={28} color="#374151" />
            </TouchableOpacity>
            <Text className="font-kanit text-xl font-bold text-gray-900">
              ตั้งค่า WiFi
            </Text>
            <View className="w-8" />
          </View>

          {/* Progress Bar */}
          <View className="px-6">
            <View className="relative">
              {/* Connecting Line (Background) */}
              <View
                className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-gray-200"
                style={{ zIndex: 0 }}
              />
              {/* Active Lines */}
              <View
                className="absolute top-4 left-[16%] right-[84%] h-[2px] bg-[#16AD78]"
                style={{ zIndex: 1 }}
              />
              <View
                className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-[#16AD78]"
                style={{ zIndex: 1 }}
              />

              {/* Steps (Foreground) */}
              <View className="flex-row justify-between">
                {/* Step 1 */}
                <View className="flex-1 items-center">
                  <View className="w-8 h-8 rounded-full bg-[#16AD78] items-center justify-center z-10 mb-2 shadow-sm border border-[#16AD78]">
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                  <Text
                    style={{ fontSize: 12 }}
                    className="text-green-600 text-center font-kanit"
                  >
                    กรอกข้อมูล{"\n"}ผู้สูงอายุ
                  </Text>
                </View>

                {/* Step 2 */}
                <View className="flex-1 items-center">
                  <View className="w-8 h-8 rounded-full bg-[#16AD78] items-center justify-center z-10 mb-2 shadow-sm border border-[#16AD78]">
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                  <Text
                    style={{ fontSize: 12 }}
                    className="text-green-600 text-center font-kanit"
                  >
                    ติดตั้งอุปกรณ์
                  </Text>
                </View>

                {/* Step 3 */}
                <View className="flex-1 items-center">
                  <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center z-10 mb-2 shadow-sm border border-blue-600">
                    <Text
                      style={{ fontSize: 14, fontWeight: "600" }}
                      className="text-white font-kanit"
                    >
                      3
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 12 }}
                    className="text-blue-600 text-center font-kanit"
                  >
                    ตั้งค่า WiFi
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    >
      <View>
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

        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700">
            🚧 โหมดทดสอบ: ใส่ WiFi อะไรก็ได้ (ยังไม่ connect จริง)
          </Text>
        </View>

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
