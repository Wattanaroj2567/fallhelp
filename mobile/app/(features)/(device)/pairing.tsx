import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pairDevice } from "@/services/deviceService";
import { apiClient } from "@/services/api";
import { getUserElders } from "@/services/userService";
import { useCurrentElder } from "@/hooks/useCurrentElder";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenHeader } from "@/components/ScreenHeader";
import { getErrorMessage } from "@/utils/errorHelper";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Device Re-Pairing Screen
// ==========================================
export default function DevicePairing() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // ==========================================
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [macAddress, setMacAddress] = useState("");
  const isScanning = useRef(false);

  // Check Permissions
  const { data: currentElder } = useCurrentElder();
  const isReadOnly = currentElder?.accessLevel === 'VIEWER';

  React.useEffect(() => {
    if (isReadOnly) {
      Alert.alert(
        "ไม่มีสิทธิ์เข้าถึง",
        "คุณไม่มีสิทธิ์ในการจับคู่อุปกรณ์ กรุณาติดต่อญาติผู้ดูแลหลัก",
        [{ text: "ตกลง", onPress: () => router.back() }]
      );
    }
  }, [isReadOnly]);

  // Request camera permission on mount
  React.useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      // Permission denied permanently
    } else if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // ==========================================
  const queryClient = useQueryClient();

  const pairMutation = useMutation({
    mutationKey: ["pairDevice"],
    mutationFn: async (deviceCode: string) => {
      // Fetch user's elders to get an ID using the service
      // Better to use currentElder if available
      const elderId = currentElder?.id;

      if (!elderId) {
        throw new Error("ไม่พบข้อมูลผู้สูงอายุ กรุณาสร้างข้อมูลผู้สูงอายุก่อน");
      }

      // Check if already paired with this device
      if (currentElder?.device?.deviceCode === deviceCode) {
        // Already paired to us - treat as success
        return currentElder.device;
      }

      return await pairDevice({ deviceCode, elderId });
    },
    onSuccess: (device, variables) => {
      // Keep isScanning = true to prevent further scans while alert shows or navigating
      queryClient.invalidateQueries({ queryKey: ["userElders"] });

      Alert.alert("เชื่อมต่ออุปกรณ์สำเร็จ", "เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว", [
        {
          text: "ไปตั้งค่า WiFi",
          onPress: () =>
            router.replace({
              pathname: "/(features)/(device)/wifi-config",
              params: { deviceCode: variables, from: 'pairing' },
            }),
        },
      ]);
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      let displayMessage = message;

      if (message === 'DEVICE_ALREADY_PAIRED') {
        displayMessage = "อุปกรณ์นี้ถูกเชื่อมต่อกับบัญชีอื่นอยู่แล้ว กรุณายกเลิกการเชื่อมต่อจากบัญชีเดิมก่อน";
      } else {
        console.error("Error pairing device:", error);
      }

      Alert.alert(
        "เชื่อมต่อไม่สำเร็จ",
        displayMessage,
        [
          {
            text: "ตกลง",
            onPress: () => {
              // Only reset scanning when user acknowledges the error
              isScanning.current = false;
            },
          },
        ]
      );
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // ==========================================
  const handleManualPairing = async () => {
    if (isReadOnly) return;

    if (!macAddress || macAddress.length < 8) {
      Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกรหัสอุปกรณ์ 8 หลัก");
      return;
    }
    pairMutation.mutate(macAddress);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (isReadOnly) return;

    // Prevent multiple scans
    if (isScanning.current || pairMutation.isPending) return;
    isScanning.current = true;
    pairMutation.mutate(data);
  };

  const handleBack = () => {
    if (showManualEntry) {
      setShowManualEntry(false);
      isScanning.current = false;
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/settings");
      }
    }
  };

  if (isReadOnly) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16AD78" />
      </View>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Manual Entry Mode)
  // ==========================================
  if (showManualEntry) {
    return (
      <ScreenWrapper
        contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
        keyboardAvoiding
        useScrollView={false}
        header={<ScreenHeader title="" onBack={handleBack} />}
      >
        <View className="flex-1">
          {/* Header Text */}
          <Text
            className="font-kanit font-bold text-gray-900"
            style={{ fontSize: 28, marginBottom: 8 }}
          >
            กรอกรหัสอุปกรณ์
          </Text>
          <Text
            className="font-kanit text-gray-500"
            style={{ fontSize: 15, marginBottom: 24 }}
          >
            กรุณากรอกรหัสอุปกรณ์ 8 หลักที่ติดบนสติ๊กเกอร์ของอุปกรณ์
          </Text>

          {/* Example */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
            <Text
              style={{ fontSize: 13 }}
              className="font-kanit text-gray-500"
            >
              ตัวอย่างรหัสอุปกรณ์:
            </Text>
            <Text
              style={{ fontSize: 18, fontWeight: "600", letterSpacing: 2 }}
              className="font-kanit text-gray-800 mt-1"
            >
              832CE051
            </Text>
          </View>

          {/* Input */}
          <View className="mb-6">
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
          </View>

          <TouchableOpacity
            onPress={handleManualPairing}
            disabled={pairMutation.isPending}
            className="bg-[#16AD78] rounded-2xl py-4 items-center shadow-sm"
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
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 📸 LAYER: View (Camera Mode)
  // ==========================================
  return (
    <View className="flex-1 bg-black">
      {/* Background Camera Layer */}
      {permission?.granted && (
        <CameraView
          style={[StyleSheet.absoluteFill]}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      {/* UI Overlay Layer */}
      <View className="flex-1">
        <ScreenHeader transparent={true} title="เชื่อมต่ออุปกรณ์" onBack={handleBack} />

        {/* Camera Overlay Content */}
        <View className="flex-1 justify-between pb-10">
          {/* Center Scanning Area */}
          <View className="flex-1 items-center justify-center">
            {!permission?.granted ? (
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
          <View className="px-6 items-center">
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
      </View>
    </View>
  );
}
