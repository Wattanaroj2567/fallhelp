import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUserElders } from "@/services/userService";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Calculate age from DOB
// ==========================================
const calculateAge = (dateOfBirth: string | null | undefined): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format Thai date
// ==========================================
const formatThaiDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "ไม่ระบุ";
  const date = new Date(dateString);
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format gender text
// ==========================================
const getGenderText = (gender: string | null | undefined): string => {
  if (!gender) return "ไม่ระบุ";
  switch (gender) {
    case "MALE":
      return "ชาย";
    case "FEMALE":
      return "หญิง";
    case "OTHER":
      return "อื่นๆ";
    default:
      return "ไม่ระบุ";
  }
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Elder Info Screen
// ==========================================
export default function ElderInfo() {
  const router = useRouter();
  const navigation = useNavigation();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder Profile
  // ==========================================
  const {
    data: elder,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["userElders"],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  if (isLoading) {
    return (
      <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16AD78" />
          <Text className="font-kanit text-gray-500 mt-4">
            กำลังโหลดข้อมูล...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError) {
    return (
      <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
        <View className="flex-1 justify-center items-center">
          <Text className="font-kanit text-red-500 mb-4">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-gray-200 p-3 rounded-lg"
          >
            <Text className="font-kanit">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (!elder) {
    return (
      <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="person-outline" size={64} color="#D1D5DB" />
          <Text
            style={{ fontSize: 18 }}
            className="font-kanit text-gray-700 mt-4 text-center"
          >
            ไม่พบข้อมูลผู้สูงอายุ
          </Text>
          <Text className="font-kanit text-gray-500 mt-2 text-center">
            กรุณาเพิ่มข้อมูลผู้สูงอายุในระบบ
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🧩 LAYER: Logic (Presentation Logic)
  // Purpose: Calculate derived state
  // ==========================================
  const age = calculateAge(elder.dateOfBirth);

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
      {/* Header */}
      <ScreenHeader
        title="ข้อมูลผู้สูงอายุ"
        onBack={() => {
          // If no back stack (e.g., deep link or fresh launch), go to dashboard instead of throwing
          if (navigation.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#16AD78"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4">
          {/* Info Fields - Box with Border */}
          <View className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-6">
            <View className="rounded-[24px] overflow-hidden">
              {/* Name */}
              <View className="p-4 border-b border-gray-100">
                <Text
                  style={{ fontSize: 12 }}
                  className="font-kanit text-gray-500 mb-1"
                >
                  ชื่อ-นามสกุล
                </Text>
                <Text
                  style={{ fontSize: 16 }}
                  className="font-kanit text-gray-900"
                >
                  {elder.firstName} {elder.lastName}
                </Text>
              </View>

              {/* Row 1: Gender & DOB */}
              <View className="flex-row border-b border-gray-100">
                <View className="flex-1 p-4 border-r border-gray-100">
                  <Text
                    style={{ fontSize: 12 }}
                    className="font-kanit text-gray-500 mb-1"
                  >
                    เพศ
                  </Text>
                  <Text
                    style={{ fontSize: 16 }}
                    className="font-kanit text-gray-900"
                  >
                    {getGenderText(elder.gender)}
                  </Text>
                </View>
                <View className="flex-1 p-4">
                  <Text
                    style={{ fontSize: 12 }}
                    className="font-kanit text-gray-500 mb-1"
                  >
                    วัน/เดือน/ปีเกิด
                  </Text>
                  <Text
                    style={{ fontSize: 16 }}
                    className="font-kanit text-gray-900"
                  >
                    {formatThaiDate(elder.dateOfBirth)}
                  </Text>
                  {age > 0 && (
                    <Text
                      style={{ fontSize: 14 }}
                      className="font-kanit text-gray-500 mt-1"
                    >
                      ({age} ปี)
                    </Text>
                  )}
                </View>
              </View>

              {/* Row 2: Height & Weight */}
              <View className="flex-row border-b border-gray-100">
                <View className="flex-1 p-4 border-r border-gray-100">
                  <Text
                    style={{ fontSize: 12 }}
                    className="font-kanit text-gray-500 mb-1"
                  >
                    ส่วนสูง
                  </Text>
                  <Text
                    style={{ fontSize: 16 }}
                    className="font-kanit text-gray-900"
                  >
                    {elder.height ? `${elder.height} cm` : "ไม่ระบุ"}
                  </Text>
                </View>
                <View className="flex-1 p-4">
                  <Text
                    style={{ fontSize: 12 }}
                    className="font-kanit text-gray-500 mb-1"
                  >
                    น้ำหนัก
                  </Text>
                  <Text
                    style={{ fontSize: 16 }}
                    className="font-kanit text-gray-900"
                  >
                    {elder.weight ? `${elder.weight} kg` : "ไม่ระบุ"}
                  </Text>
                </View>
              </View>

              {/* Diseases */}
              <View className="p-4 border-b border-gray-100">
                <Text
                  style={{ fontSize: 12 }}
                  className="font-kanit text-gray-500 mb-1"
                >
                  โรคประจำตัว
                </Text>
                <Text
                  style={{ fontSize: 16 }}
                  className="font-kanit text-gray-900"
                >
                  {elder.diseases && elder.diseases.length > 0
                    ? elder.diseases.join(", ")
                    : "ไม่มี"}
                </Text>
              </View>

              {/* Address */}
              <View className="p-4">
                <Text
                  style={{ fontSize: 12 }}
                  className="font-kanit text-gray-500 mb-1"
                >
                  ที่อยู่
                </Text>
                <Text
                  style={{ fontSize: 16 }}
                  className="font-kanit text-gray-900"
                >
                  {(() => {
                    const addressParts = [];
                    if (elder.houseNumber)
                      addressParts.push(`บ้านเลขที่ ${elder.houseNumber}`);
                    if (elder.village)
                      addressParts.push(`หมู่ที่ ${elder.village}`);
                    if (elder.subdistrict)
                      addressParts.push(`ตำบล${elder.subdistrict}`);
                    if (elder.district)
                      addressParts.push(`อำเภอ${elder.district}`);
                    if (elder.province)
                      addressParts.push(`จังหวัด${elder.province}`);
                    if (elder.zipcode) addressParts.push(elder.zipcode);

                    return addressParts.length > 0
                      ? addressParts.join(" ")
                      : "ไม่ระบุ";
                  })()}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit Button */}
          {/* Edit Button - Hide if Read Only */}
          {(elder.accessLevel === 'OWNER' || elder.accessLevel === 'EDITOR') && (
            <PrimaryButton
              title="แก้ไขข้อมูล"
              variant="outline"
              onPress={() => router.push("/(features)/(elder)/edit")}
            />
          )}

          {/* View Only Message */}
          {elder.accessLevel !== 'OWNER' && elder.accessLevel !== 'EDITOR' && (
            <View className="bg-gray-50 rounded-2xl p-4 mt-6 items-center">
              <MaterialIcons name="lock-outline" size={24} color="#9CA3AF" />
              <Text className="font-kanit text-gray-500 text-center mt-2">
                คุณมีสิทธิ์ดูข้อมูลเท่านั้น
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
