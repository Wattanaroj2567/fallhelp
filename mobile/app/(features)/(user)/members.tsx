import React from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/services/userService";
// Removed duplicate Image import
import { listMembers } from "@/services/elderService";
import { useCurrentElder } from "@/hooks/useCurrentElder";
import Logger from "@/utils/logger";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Bounceable } from "@/components/Bounceable";
import { LoadingScreen } from "@/components/LoadingScreen";

interface MemberDisplay {
  id: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  name: string;
  profileImage?: string | null;
}

// ==========================================
// 🧩 LAYER: View (Sub-Component)
// Purpose: Optimized Member Item
// ==========================================
const MemberItem = React.memo(
  ({
    item,
    currentUserId,
  }: {
    item: MemberDisplay;
    currentUserId?: string;
  }) => {
    const router = useRouter();
    const isMe = currentUserId === item.id;
    const isOwner = item.role === "OWNER";

    const handlePress = () => {
      if (isMe) return;

      router.push({
        pathname: "/(features)/(user)/member-detail",
        params: {
          memberId: item.id,
          initialRole: item.role,
          memberName: item.name,
          memberEmail: item.email,
          memberImage: item.profileImage || "",
        },
      });
    };

    return (
      <Bounceable
        onPress={handlePress}
        disabled={isMe}
        scale={1}
        style={{ borderRadius: 24, marginBottom: 12 }}
        className={`bg-white rounded-[24px] shadow-sm border border-gray-100 ${isMe ? "opacity-90" : ""} active:bg-gray-50`}
      >
        <View className="p-5 flex-row items-center justify-between">
          {/* Left Content */}
          <View className="flex-row items-center flex-1">
            {/* Avatar */}
            <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-4 overflow-hidden border-2 border-white shadow-sm">
              {item.profileImage ? (
                <Image
                  source={{ uri: item.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={28} color="#9CA3AF" />
              )}
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text
                style={{ fontSize: 16, fontWeight: "600" }}
                className="font-kanit text-gray-900 mb-0.5"
              >
                {item.name}
                {isMe && <Text className="text-blue-600"> (ฉัน)</Text>}
              </Text>
              <Text
                style={{ fontSize: 12 }}
                className="font-kanit text-gray-400 mb-2"
              >
                {item.email}
              </Text>

              <View className="flex-row flex-wrap gap-1.5">
                {/* Role Badge */}
                <View
                  className={`px-2.5 py-0.5 rounded-full ${isOwner ? "bg-purple-100" : "bg-gray-100"}`}
                >
                  <Text
                    style={{ fontSize: 10 }}
                    className={`font-kanit font-medium ${isOwner ? "text-purple-700" : "text-gray-600"}`}
                  >
                    {isOwner ? "ญาติผู้ดูแลหลัก" : "ญาติผู้ดูแลเสริม"}
                  </Text>
                </View>

                {/* Viewer Badge */}
                {!isOwner && item.role === "VIEWER" && (
                  <View className="px-2.5 py-0.5 rounded-full bg-orange-50">
                    <Text style={{ fontSize: 10 }} className="font-kanit text-orange-600 font-medium">
                      ดูอย่างเดียว
                    </Text>
                  </View>
                )}

                {/* Editor Badge */}
                {!isOwner && item.role === "EDITOR" && (
                  <View className="px-2.5 py-0.5 rounded-full bg-teal-50">
                    <Text style={{ fontSize: 10 }} className="font-kanit text-teal-600 font-medium">
                      แก้ไขได้
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Right Chevron - Only show if not me */}
          {!isMe && (
            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center ml-2">
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
      </Bounceable>
    );
  }
);

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Members Management Screen
// ==========================================
export default function Members() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch Elder ID & Members List
  // ==========================================

  // 1. Fetch User Profile to identify "Me"
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });

  // 2. Fetch Elder ID
  const { data: currentElder } = useCurrentElder();

  // 3. Fetch Members using Elder ID
  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["members", currentElder?.id],
    queryFn: async () => {
      if (!currentElder?.id) return [];
      const memberList = await listMembers(currentElder.id);

      if (!Array.isArray(memberList)) {
        Logger.warn("memberList is not an array:", memberList);
        return [];
      }

      return memberList.map((m: any) => ({
        id: m.userId || m.id,
        email: m.user?.email || m.email || "ไม่ระบุ",
        role: (m.accessLevel === "OWNER"
          ? "OWNER"
          : m.accessLevel === "EDITOR"
            ? "EDITOR"
            : "VIEWER") as "OWNER" | "EDITOR" | "VIEWER",
        name: m.user ? `${m.user.firstName} ${m.user.lastName}` : "ไม่ระบุ",
        profileImage: m.user?.profileImage,
      }));
    },
    enabled: !!currentElder?.id,
  });

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render empty state
  // ==========================================
  const renderEmptyState = () => (
    <View className="items-center justify-center py-12">
      <MaterialIcons name="people" size={80} color="#D1D5DB" />
      <Text
        style={{ fontSize: 18, fontWeight: "600" }}
        className="font-kanit text-gray-900 mt-4"
      >
        ยังไม่มีสมาชิกในกลุ่ม
      </Text>
      <Text
        style={{ fontSize: 14 }}
        className="font-kanit text-gray-500 mt-2 text-center px-6"
      >
        เชิญสมาชิกคนอื่นเข้ามาดูแลผู้สูงอายุร่วมกัน
      </Text>
      <View className="w-full px-6 mt-6">
        <PrimaryButton
          title="เชิญสมาชิก"
          onPress={() => router.push("/(features)/(user)/invite-member")}
        />
      </View>
    </View>
  );

  if (isError) {
    return (
      <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
        <View className="flex-1 justify-center items-center">
          <Text className="font-kanit text-red-500 mb-4">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </Text>
          <Bounceable
            onPress={() => refetch()}
            className="p-3 rounded-lg"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <Text className="font-kanit">ลองใหม่</Text>
          </Bounceable>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <ScreenWrapper
      edges={["top"]}
      useScrollView={false}
      style={{ backgroundColor: "#F9FAFB" }}
    >
      {/* Header */}
      <ScreenHeader
        title={`จัดการสมาชิก (${Math.max(0, (members?.length || 0) - 1)})`}
        onBack={() => router.back()}
        backgroundColor="#F9FAFB"
      />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View className="flex-1">
          {/* Info Box */}
          <View className="px-6 pt-4">
            <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
              <View className="flex-row items-start">
                <MaterialIcons
                  name="info"
                  size={20}
                  color="#3B82F6"
                  style={{ marginTop: 2 }}
                />
                <Text
                  style={{ fontSize: 13, lineHeight: 20 }}
                  className="font-kanit text-blue-700 ml-2 flex-1"
                >
                  สมาชิกสามารถถูกกำหนดสิทธิ์ให้แก้ไขข้อมูลได้
                  หรือดูได้อย่างเดียว
                  โดยการแตะที่รายชื่อเพื่อจัดการสิทธิ์
                </Text>
              </View>
            </View>
          </View>

          {/* Member List */}
          <View className="flex-1 px-6">
            <FlatList
              data={members}
              renderItem={({ item }) => (
                <MemberItem item={item} currentUserId={userProfile?.id} />
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>

          {/* Invite Button (Only for Owner) */}
          {members &&
            members.length > 0 &&
            currentElder?.accessLevel === "OWNER" && (
              <View className="px-6 pb-8">
                <PrimaryButton
                  title="เชิญสมาชิกเข้ากลุ่มของคุณ"
                  onPress={() =>
                    router.push("/(features)/(user)/invite-member")
                  }
                />
              </View>
            )}
        </View>
      )}
    </ScreenWrapper>
  );
}
