import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { pairDevice } from "@/services/deviceService";
import * as SecureStore from "expo-secure-store";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { WizardLayout } from "@/components/WizardLayout";
import { getErrorMessage } from "@/utils/errorHelper";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 2 of Setup - Device Pairing
// ==========================================
export default function Step2() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage pairing state
  // ==========================================
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [macAddress, setMacAddress] = useState("");
  const [existingDeviceId, setExistingDeviceId] = useState<string | null>(null);
  // showCamera is no longer needed as state, we default to camera view
  const isScanning = useRef(false);

  // Check if device already paired
  React.useEffect(() => {
    const checkExistingDevice = async () => {
      const deviceId = await SecureStore.getItemAsync("setup_deviceId");
      setExistingDeviceId(deviceId);
      // ❌ Removed auto-skip: Let user see Step 2 even if device already paired
      // This allows proper back navigation: Step 3 → Step 2 → Step 1
    };
    checkExistingDevice();
  }, []); // Request permission on mount
  React.useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      // Permission denied permanently
    } else if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Pair device with elder
  // ==========================================
  const pairMutation = useMutation({
    mutationFn: async (deviceCode: string) => {
      const elderId = await SecureStore.getItemAsync("setup_elderId");
      if (!elderId)
        throw new Error("ไม่พบข้อมูลผู้สูงอายุ กรุณากลับไปทำขั้นตอนที่ 1 ใหม่");
      return await pairDevice({ deviceCode, elderId });
    },
    onSuccess: async (device) => {
      await SecureStore.setItemAsync("setup_deviceId", String(device.id));
      await SecureStore.setItemAsync("setup_step", "3");
      Alert.alert("เชื่อมต่ออุปกรณ์สำเร็จ", "เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.push("/(setup)/step3-wifi-setup"),
        },
      ]);
    },
    onError: (error: any) => {
      console.error("Error pairing device:", error);
      const message = getErrorMessage(error);
      Alert.alert(
        "ข้อผิดพลาด",
        message,
        [
          {
            text: "ตกลง",
            onPress: () => {
              isScanning.current = false;
            },
          },
        ]
      );
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle pairing actions
  // ==========================================
  const handleManualPairing = async () => {
    if (!macAddress || macAddress.length < 8) {
      Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกรหัสอุปกรณ์ 8 หลัก");
      return;
    }
    pairMutation.mutate(macAddress);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Prevent multiple scans
    if (isScanning.current || pairMutation.isPending) return;
    isScanning.current = true;
    pairMutation.mutate(data);
  };

  // ==========================================
  // 🧩 LAYER: Logic (Navigation & State)
  // ==========================================
  const handleChangeDevice = async () => {
    Alert.alert(
      "เปลี่ยนอุปกรณ์",
      "ต้องการยกเลิกการผูกอุปกรณ์เดิมและเชื่อมต่ออุปกรณ์ใหม่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          style: "destructive",
          onPress: async () => {
            try {
              if (existingDeviceId) {
                const {
                  unpairDevice,
                } = require("../../services/deviceService");
                await unpairDevice({ deviceId: existingDeviceId });
              }
              await SecureStore.deleteItemAsync("setup_deviceId");
              setExistingDeviceId(null);
              Alert.alert(
                "สำเร็จ",
                "ยกเลิกการผูกอุปกรณ์เรียบร้อยแล้ว คุณสามารถสแกนอุปกรณ์ใหม่ได้"
              );
            } catch (error) {
              Alert.alert("ข้อผิดพลาด", "ไม่สามารถยกเลิกการผูกอุปกรณ์ได้");
            }
          },
        },
      ]
    );
  };

  const handleBack = async () => {
    if (showManualEntry) {
      setShowManualEntry(false);
    } else {
      // Go back to Step 1
      await SecureStore.setItemAsync("setup_step", "1");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(setup)/step1-elder-info");
      }
    }
  };

  // ==========================================
  // 🎨 LAYER: UI Components (Shared)
  // ==========================================
  // ==========================================
  // 🎨 LAYER: UI Components
  // ==========================================
  // renderHeader removed - using WizardLayout

  // ==========================================
  // 🖼️ LAYER: View (Manual Entry Mode)
  // ==========================================
  if (showManualEntry) {
    return (
      <WizardLayout
        currentStep={2}
        title="ติดตั้งอุปกรณ์"
        onBack={handleBack}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
      >
        {existingDeviceId && (
          <View className="bg-green-50 rounded-2xl p-4 mb-6 mt-6 border border-green-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="#16AD78" />
              <Text
                style={{ fontSize: 16, fontWeight: "600" }}
                className="font-kanit text-green-800 ml-2"
              >
                อุปกรณ์ถูกผูกแล้ว
              </Text>
            </View>
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-green-700 mb-3"
            >
              คุณสามารถไปขั้นตอนต่อไป หรือเปลี่ยนอุปกรณ์ใหม่
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push("/(setup)/step3-wifi-setup")}
                className="flex-1 bg-green-600 rounded-xl py-3 items-center"
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600" }}
                  className="font-kanit text-white"
                >
                  ไปขั้นตอนถัดไป
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangeDevice}
                className="flex-1 bg-white border border-green-600 rounded-xl py-3 items-center"
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600" }}
                  className="font-kanit text-green-600"
                >
                  เปลี่ยนอุปกรณ์
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-6">
          <Text
            style={{ fontSize: 14 }}
            className="font-kanit text-blue-700 mb-2"
          >
            กรุณากรอกรหัสอุปกรณ์ 8 หลัก
          </Text>
          <Text
            style={{ fontSize: 14 }}
            className="font-kanit text-blue-700"
          >
            ที่ติดบนสติ๊กเกอร์ของอุปกรณ์
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: "600" }}
            className="font-kanit text-blue-900 mt-2"
          >
            ตัวอย่าง: 832CE051
          </Text>
        </View>

        <View className="items-center mb-6">
          <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons
              name="hardware-chip-outline"
              size={64}
              color="#16AD78"
            />
          </View>
        </View>

        <FloatingLabelInput
          label="รหัสอุปกรณ์ (Device Code)"
          value={macAddress}
          onChangeText={(text) =>
            setMacAddress(
              text
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 8)
            )
          }
          autoCapitalize="characters"
          maxLength={8}
        />

        <TouchableOpacity
          onPress={handleManualPairing}
          disabled={pairMutation.isPending}
          className="bg-[#16AD78] rounded-2xl py-4 items-center mb-4"
          style={{ opacity: pairMutation.isPending ? 0.6 : 1 }}
        >
          {pairMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{ fontSize: 16, fontWeight: "600" }}
              className="font-kanit text-white"
            >
              ยืนยัน
            </Text>
          )}
        </TouchableOpacity>
      </WizardLayout>
    );
  }

  // ==========================================
  // 📸 LAYER: View (Camera Mode)
  // ==========================================
  return (
    <View className="flex-1 bg-black">
      {/* Background Camera Layer */}
      {/* 
         NOTE: Camera permissions handled in logic layer. 
         If granted, show CameraView.
      */}
      {permission?.granted && (
        <CameraView
          style={[StyleSheet.absoluteFill]}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      {/* UI Overlay Layer */}
      {/* Use WizardLayout in transparent mode */}
      <WizardLayout
        currentStep={2}
        title="ติดตั้งอุปกรณ์"
        onBack={handleBack}
        transparent={true}
      >
        {/* Camera Overlay Content */}
        {/* We need flex-1 here to fill the space provided by WizardLayout's children container */}
        <View className="flex-1 justify-between pb-10 px-6">
          {/* Center Scanning Area */}
          <View className="flex-1 items-center justify-center">
            {existingDeviceId ? (
              // Device already paired - show success message
              <View className="items-center w-full">
                <View className="w-24 h-24 rounded-full bg-green-500 items-center justify-center mb-6">
                  <Ionicons name="checkmark-circle" size={64} color="white" />
                </View>
                <Text className="font-kanit text-white text-2xl font-bold text-center mb-3">
                  อุปกรณ์ถูกผูกแล้ว
                </Text>
                <Text className="font-kanit text-white/90 text-base text-center mb-8">
                  คุณสามารถไปขั้นตอนถัดไปได้เลย
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(setup)/step3-wifi-setup")}
                  className="bg-white rounded-2xl px-8 py-4 mb-4 w-full items-center"
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600" }}
                    className="font-kanit text-green-600"
                  >
                    ไปขั้นตอนถัดไป
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangeDevice}
                  className="bg-white/20 border-2 border-white rounded-2xl px-8 py-4 w-full items-center"
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600" }}
                    className="font-kanit text-white"
                  >
                    เปลี่ยนอุปกรณ์
                  </Text>
                </TouchableOpacity>
              </View>
            ) : !permission?.granted ? (
              <View className="items-center px-6">
                <Text className="font-kanit text-white text-center mb-6 text-lg">
                  ต้องการสิทธิ์การเข้าถึงกล้องเพื่อสแกน QR Code
                </Text>
                <TouchableOpacity
                  onPress={requestPermission}
                  className="bg-[#16AD78] px-8 py-3 rounded-full shadow-lg"
                >
                  <Text className="font-kanit text-white font-bold text-base">
                    อนุญาตให้ใช้กล้อง
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="w-72 h-72 relative">
                  {/* Corner Borders */}
                  <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#16AD78] rounded-tl-2xl" />
                  <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#16AD78] rounded-tr-2xl" />
                  <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#16AD78] rounded-bl-2xl" />
                  <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#16AD78] rounded-br-2xl" />

                  {/* Scanning Animation Line */}
                  <View className="absolute top-1/2 left-4 right-4 h-[1px] bg-[#16AD78]/50" />
                </View>

                <View className="mt-8 bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md">
                  <Text className="font-kanit text-white text-lg text-center font-semibold">
                    สแกน QR Code
                  </Text>
                  <Text className="font-kanit text-gray-200 text-sm text-center mt-1">
                    วาง QR Code ให้อยู่ในกรอบเพื่อเชื่อมต่อ
                  </Text>
                  {pairMutation.isError && (
                    <Text className="font-kanit text-red-400 text-sm text-center mt-2">
                      ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Bottom Action */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => setShowManualEntry(true)}
              className="flex-row items-center bg-white/20 px-6 py-4 rounded-full border border-white/30 backdrop-blur-md shadow-lg active:bg-white/30"
            >
              <Ionicons name="keypad" size={20} color="white" />
              <Text className="font-kanit text-white ml-3 font-semibold text-base">
                กรอกรหัสอุปกรณ์ด้วยตนเอง
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </WizardLayout>
    </View>
  );
}
