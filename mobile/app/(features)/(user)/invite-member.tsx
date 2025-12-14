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
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      useScrollView={false}
      header={<ScreenHeader title="" onBack={() => router.back()} />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          เชิญสมาชิก
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          กรุณากรอกอีเมลผู้ใช้ที่คุณต้องการเชิญ
        </Text>

        {/* Email Input */}
        <View className="mb-6">
          <View>
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
        </View>

        {/* Features List (Already Card-like, just refine style) */}
        <View className="bg-white rounded-[24px] p-6 mb-6 border border-gray-100 shadow-sm">
          <Text
            style={{ fontSize: 15, fontWeight: "600" }}
            className="font-kanit text-gray-900 mb-4"
          >
            สิทธิ์ของสมาชิกที่ถูกเชิญ:
          </Text>
          <View className="flex-row items-start mb-3">
            <MaterialIcons name="check-circle" size={20} color="#16AD78" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ดูข้อมูลผู้สูงอายุ
            </Text>
          </View>
          <View className="flex-row items-start mb-3">
            <MaterialIcons name="check-circle" size={20} color="#16AD78" />
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-700 ml-2 flex-1"
            >
              ดูแดชบอร์ดและสถานะ Real-time
            </Text>
          </View>
          <View className="flex-row items-start mb-3">
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
        <View className="mt-2 text-center pb-8">
          <PrimaryButton
            title="ส่งคำเชิญ"
            onPress={handleInvite}
            loading={inviteMutation.isPending}
            disabled={!email.trim() || !!emailError}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
