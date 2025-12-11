import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteMember } from "@/services/elderService";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { useCurrentElder } from "@/hooks/useCurrentElder";
import Logger from "@/utils/logger";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Invite Member Screen
// ==========================================
export default function InviteMember() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage email input
  // ==========================================
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder ID
  // ==========================================
  const { data: currentElder } = useCurrentElder();

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Send invitation
  // ==========================================
  const inviteMutation = useMutation({
    mutationFn: async (data: { elderId: string; email: string }) => {
      await inviteMember(data.elderId, { email: data.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      Alert.alert("สำเร็จ", "เชิญสมาชิกผู้ดูแลคนอื่นเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Logger.error("Error inviting member:", error);
      Alert.alert("ข้อผิดพลาด", error.message || "ไม่สามารถเชิญสมาชิกได้");
    },
  });

  // ==========================================
  // 🧩 LAYER: Logic (Validation)
  // Purpose: Validate email format
  // ==========================================
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle invite submission
  // ==========================================
  const handleInvite = () => {
    if (!email.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกอีเมลผู้ใช้ที่ต้องการเชิญ");
      return;
    }

    if (emailError) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("รูปแบบอีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    if (!currentElder?.id) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้สูงอายุ");
      return;
    }

    inviteMutation.mutate({
      elderId: currentElder.id,
      email: email.trim(),
    });
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the invite form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      useScrollView={false}
    >
      {/* Header */}
      <ScreenHeader title="เชิญสมาชิก" onBack={() => router.back()} />

      <View className="px-6 pt-2">
        {/* Icon */}
        <View className="items-center mb-6 mt-2">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
            <MaterialIcons name="person-add" size={40} color="#16AD78" />
          </View>
        </View>

        {/* Info Text */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text
            style={{ fontSize: 15, fontWeight: "500" }}
            className="font-kanit text-blue-700 mb-1"
          >
            กรุณากรอกอีเมลผู้ใช้ที่คุณต้องการเชิญ
          </Text>
          <Text style={{ fontSize: 13 }} className="font-kanit text-blue-600">
            สมาชิกใหม่จะได้รับสิทธิ์ "ดูได้อย่างเดียว" เป็นค่าเริ่มต้น คุณสามารถปรับเปลี่ยนสิทธิ์ให้ช่วยแก้ไขข้อมูลได้ในภายหลัง
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-6">
          <FloatingLabelInput
            label="อีเมล"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (/[ก-๙]/.test(text)) {
                setEmailError("กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
              } else {
                setEmailError("");
              }
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
        </View>

        {/* Features List */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
          <Text
            style={{ fontSize: 15, fontWeight: "600" }}
            className="font-kanit text-gray-900 mb-3"
          >
            สิทธิ์ของสมาชิกที่ถูกเชิญ:
          </Text>
          <View className="flex-row items-start mb-2">
            <MaterialIcons name="check-circle" size={20} color="#16AD78" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ดูข้อมูลผู้สูงอายุ
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <MaterialIcons name="check-circle" size={20} color="#16AD78" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ดูแดชบอร์ดและสถานะ Real-time
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <MaterialIcons name="check-circle" size={20} color="#16AD78" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ดูประวัติการหกล้ม
            </Text>
          </View>
          <View className="flex-row items-start">
            <MaterialIcons name="cancel" size={20} color="#EF4444" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ไม่สามารถแก้ไขหรือลบข้อมูลได้
            </Text>
          </View>
        </View>

        {/* Invite Button */}
        <PrimaryButton
          title="ส่งคำเชิญ"
          onPress={handleInvite}
          loading={inviteMutation.isPending}
          disabled={!email.trim() || !!emailError}
        />
      </View>
    </ScreenWrapper>
  );
}
