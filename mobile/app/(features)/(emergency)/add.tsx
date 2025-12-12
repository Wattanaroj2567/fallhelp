import React, { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  createContact,
  listContacts,
} from "@/services/emergencyContactService";
import { getUserElders } from "@/services/userService";
import { useQueryClient } from "@tanstack/react-query";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function AddEmergencyContact() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [elderId, setElderId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  useEffect(() => {
    fetchElderId();
  }, []);

  const fetchElderId = async () => {
    try {
      const elders = await getUserElders();
      if (elders && elders.length > 0) {
        setElderId(elders[0].id);
      }
    } catch (error) {
      Logger.error("Error fetching elder:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    if (!elderId) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้สูงอายุ");
      return;
    }

    setLoading(true);
    try {
      await createContact(elderId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });

      Alert.alert("สำเร็จ", "เพิ่มเบอร์ติดต่อฉุกเฉินเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Logger.error("Error adding contact:", error);
      Alert.alert("ข้อผิดพลาด", error.message || "ไม่สามารถเพิ่มข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, flexGrow: 1 }}
      header={
        <View style={{ backgroundColor: "#FFFFFF" }}>
          <ScreenHeader
            title="เพิ่มเบอร์ติดต่อฉุกเฉิน"
            onBack={() => router.back()}
          />
          {/* Fixed Info Note */}
          <View className="px-6 pb-4 border-b border-gray-50">
            <View className="bg-blue-50 rounded-2xl p-4">
              <Text className="font-kanit text-blue-700" style={{ fontSize: 13, lineHeight: 20 }}>
                กรุณากรอกข้อมูลให้ถูกต้องเพื่อให้ระบบติดต่อญาติได้ทันทีเมื่อเกิดเหตุฉุกเฉิน
              </Text>
            </View>
          </View>
        </View>
      }
    >
      <View className="flex-1 pt-6">
        {/* Form Container */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          {/* Name Field */}
          <View className="mb-5">
            <FloatingLabelInput
              label="ชื่อผู้ติดต่อ"
              value={name}
              onChangeText={setName}
              isRequired={true}
            />
          </View>

          {/* Phone Field */}
          <View className="mb-5">
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
          <View>
            <FloatingLabelInput
              label="ความสัมพันธ์ (ถ้ามี)"
              value={relationship}
              onChangeText={setRelationship}
              placeholder="เช่น บุตร, พี่, น้อง"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="mt-2">
          <PrimaryButton
            title="บันทึกข้อมูล"
            onPress={handleSave}
            loading={loading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
