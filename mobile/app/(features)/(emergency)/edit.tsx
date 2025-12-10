import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateContact,
  listContacts,
} from "@/services/emergencyContactService";
import { getUserElders } from "@/services/userService";
import Logger from "@/utils/logger";
import { EmergencyContact } from "@/services/types";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Emergency Contact Screen
// ==========================================
export default function EditEmergencyContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder & contact details
  // ==========================================

  // 1. Fetch Elder ID
  const { data: currentElder } = useQuery({
    queryKey: ["userElders"],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // 2. Fetch Contact Details
  const { data: contact, isLoading } = useQuery({
    queryKey: ["emergencyContact", id],
    queryFn: async () => {
      if (!currentElder?.id || !id) return null;
      const contacts = await listContacts(currentElder.id);
      return contacts.find((c) => c.id === id) || null;
    },
    enabled: !!currentElder?.id && !!id,
  });

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone);
      setRelationship(contact.relationship || "");
    }
  }, [contact]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update contact
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      relationship?: string;
    }) => {
      if (!contact?.id) throw new Error("ไม่พบข้อมูลผู้ติดต่อ");
      await updateContact(contact.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      queryClient.invalidateQueries({ queryKey: ["emergencyContact", id] });
      Alert.alert("สำเร็จ", "อัปเดตข้อมูลเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Logger.error("Error updating contact:", error);
      Alert.alert("ข้อผิดพลาด", error.message || "ไม่สามารถบันทึกข้อมูลได้");
    },
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Delete contact
  // ==========================================

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle save and delete actions
  // ==========================================
  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    if (!contact) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ติดต่อ");
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <ScreenWrapper edges={["top", "left", "right"]}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="font-kanit text-gray-500 mt-4">
            กำลังโหลดข้อมูล...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, flexGrow: 1 }}
      header={
        <ScreenHeader
          title="แก้ไขเบอร์ติดต่อฉุกเฉิน"
          onBack={() => router.back()}
        />
      }
    >
      <View>
        {/* Info Note */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-2">
          <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
            กรุณากรอกข้อมูลให้ถูกต้องเพื่อให้ระบบติดต่อญาติได้ทันทีเมื่อเกิดเหตุฉุกเฉิน
          </Text>
        </View>

        {/* Priority Badge */}
        {contact && (
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-[#4A90E2] items-center justify-center shadow-sm">
              <Text
                style={{ fontSize: 32, fontWeight: "700" }}
                className="font-kanit text-white"
              >
                {contact.priority}
              </Text>
            </View>
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-500 mt-3"
            >
              ลำดับความสำคัญ
            </Text>
          </View>
        )}

        {/* Name Field */}
        <View className="mb-4">
          <FloatingLabelInput
            label="ชื่อผู้ติดต่อ"
            value={name}
            onChangeText={setName}
            isRequired={true}
          />
        </View>

        {/* Phone Field */}
        <View className="mb-4">
          <FloatingLabelInput
            label="เบอร์ติดต่อ"
            value={phone}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              if (cleaned.length <= 10) {
                setPhone(cleaned);
              }
            }}
            keyboardType="phone-pad"
            maxLength={10}
            isRequired={true}
          />
        </View>

        {/* Relationship Field */}
        <View className="mb-8">
          <FloatingLabelInput
            label="ความสัมพันธ์ (ถ้ามี)"
            value={relationship}
            onChangeText={setRelationship}
            placeholder="เช่น บุตร, พี่, น้อง"
          />
        </View>

        {/* Save Button */}
        <PrimaryButton
          title="บันทึกการแก้ไข"
          onPress={handleSave}
          loading={updateMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>
    </ScreenWrapper>
  );
}
