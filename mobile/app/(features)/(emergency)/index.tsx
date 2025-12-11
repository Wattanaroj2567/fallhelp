import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { getUserElders } from "@/services/userService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listContacts,
  deleteContact,
  reorderContacts,
} from "@/services/emergencyContactService";
import Logger from "@/utils/logger";
import { EmergencyContact } from "@/services/types";
import { ListItemSkeleton } from "@/components/skeletons";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCurrentElder } from "@/hooks/useCurrentElder";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Emergency Contacts Management Screen
// ==========================================
export default function EmergencyContacts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [localContacts, setLocalContacts] = useState<EmergencyContact[]>([]);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Check Access Level
  // ==========================================
  const { data: currentElder, isLoading: isElderLoading } = useCurrentElder();
  const isReadOnly = !currentElder || currentElder.accessLevel !== 'OWNER';

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch contacts
  // ==========================================
  const {
    data: contacts,
    isLoading,
    refetch,
  } = useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts"],
    queryFn: async () => {
      // Use the cached elder if available, otherwise fetch
      // But here we need to ensure we get the contacts for the correct elder.
      // useCurrentElder handles fetching elders.
      // If we rely on useCurrentElder, we might wait for it.

      // Fallback or use currentElder directly if ready
      let elderId = currentElder?.id;
      if (!elderId) {
        const elders = await getUserElders();
        if (elders && elders.length > 0) {
          elderId = elders[0].id;
        }
      }

      if (elderId) {
        const contactList = await listContacts(elderId);
        if (Array.isArray(contactList)) {
          return contactList.sort((a, b) => a.priority - b.priority);
        }
      }
      return [];
    },
    enabled: true, // simplified, dependent on refetch basically or generic query
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (contacts) {
      setLocalContacts(contacts);
    }
  }, [contacts]);

  // Refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // ==========================================
  // ⚙️ LAYER: Logic (Mutations)
  // Purpose: Handle delete and update
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      Alert.alert("สำเร็จ", "ลบผู้ติดต่อเรียบร้อยแล้ว");
    },
    onError: (error: any) => {
      Alert.alert("ผิดพลาด", error.message || "ไม่สามารถลบข้อมูลได้");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({
      elderId,
      contactIds,
    }: {
      elderId: string;
      contactIds: string[];
    }) => reorderContacts(elderId, contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
    onError: (error: any) => {
      Logger.error("Reorder failed", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกลำดับได้");
      refetch(); // Revert on error
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle actions
  // ==========================================
  const handleDelete = (id: string, name: string) => {
    if (isReadOnly) return;
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบ ${name} ออกจากรายชื่อผู้ติดต่อฉุกเฉินใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleDragEnd = async ({ data }: { data: EmergencyContact[] }) => {
    if (isReadOnly) return;
    setLocalContacts(data); // Optimistic update

    // Extract IDs in new order
    const contactIds = data.map((c) => c.id);

    if (data.length > 0) {
      const elderId = data[0].elderId; // Assuming data has elderId or use currentElder.id
      reorderMutation.mutate({ elderId, contactIds });
    }
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual contact item
  // ==========================================
  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<EmergencyContact>) => {
    const index = getIndex();
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={isReadOnly ? undefined : drag}
          disabled={isActive || isReadOnly}
          activeOpacity={1}
          className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center ${isActive ? "opacity-90 shadow-lg scale-105" : ""
            }`}
        >
          {/* Drag Handle - Hide if ReadOnly */}
          {!isReadOnly && (
            <TouchableOpacity onPressIn={drag} className="mr-4 p-2">
              <MaterialIcons name="drag-handle" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Priority Badge */}
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
            <Text
              style={{ fontSize: 16, fontWeight: "700" }}
              className="font-kanit text-blue-600"
            >
              {(index || 0) + 1}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text
              style={{ fontSize: 16, fontWeight: "600" }}
              className="font-kanit text-gray-900"
            >
              {item.name} {item.relationship ? `(${item.relationship})` : ""}
            </Text>
            <Text
              style={{ fontSize: 14 }}
              className="font-kanit text-gray-500 mt-0.5"
            >
              {item.phone}
            </Text>
          </View>

          {/* Actions - Hide if ReadOnly */}
          {!isReadOnly && (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(features)/(emergency)/edit",
                    params: { id: item.id },
                  })
                }
                className="p-2 bg-blue-50 rounded-lg mr-2"
              >
                <MaterialIcons name="edit" size={20} color="#3B82F6" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2 bg-red-50 rounded-lg"
              >
                <MaterialIcons name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <ScreenWrapper edges={["top", "left", "right"]} useScrollView={false}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Header */}
        <ScreenHeader
          title="จัดการเบอร์ติดต่อฉุกเฉิน"
          onBack={() => router.back()}
        />

        {/* View Only Warning */}
        {!isElderLoading && isReadOnly && currentElder && (
          <View className="mx-6 mb-2 mt-2">
            <View className="bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex-row items-center">
              <MaterialIcons name="lock" size={16} color="#CA8A04" style={{ marginRight: 6 }} />
              <Text className="font-kanit text-yellow-700 text-xs flex-1">
                โหมดดูได้อย่างเดียว (Assistant Caregiver)
              </Text>
            </View>
          </View>
        )}

        {isLoading && localContacts.length === 0 ? (
          <View className="flex-1 pt-6">
            <ListItemSkeleton count={5} />
          </View>
        ) : (
          <View className="flex-1">
            <DraggableFlatList
              data={localContacts}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 100,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={refetch}
                  colors={["#16AD78"]}
                />
              }
              ListHeaderComponent={
                !isReadOnly ? (
                  <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row items-start">
                    <MaterialIcons
                      name="info"
                      size={20}
                      color="#3B82F6"
                      style={{ marginTop: 2 }}
                    />
                    <View className="flex-1 ml-2">
                      <Text
                        style={{ fontSize: 14, lineHeight: 22 }}
                        className="font-kanit text-blue-700"
                      >
                        ระบบจะแสดงเฉพาะ 3 รายชื่อแรกในหน้าโทรฉุกเฉิน
                      </Text>
                      <Text
                        style={{ fontSize: 13, lineHeight: 20 }}
                        className="font-kanit text-blue-600 mt-1"
                      >
                        กดค้างที่ขีด 3 ขีด{" "}
                        <MaterialIcons name="drag-handle" size={14} />{" "}
                        เพื่อลากจัดลำดับความสำคัญ
                      </Text>
                    </View>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-20">
                  <MaterialIcons
                    name="contact-phone"
                    size={80}
                    color="#D1D5DB"
                  />
                  <Text
                    style={{ fontSize: 20, fontWeight: "600" }}
                    className="font-kanit text-gray-900 mt-6 text-center"
                  >
                    ยังไม่มีรายชื่อผู้ติดต่อ
                  </Text>
                  <Text
                    style={{ fontSize: 14 }}
                    className="font-kanit text-gray-500 mt-2 text-center"
                  >
                    {isReadOnly
                      ? "ญาติผู้ดูแลหลักยังไม่ได้เพิ่มเบอร์ติดต่อ"
                      : "เพิ่มเบอร์ติดต่อฉุกเฉินเพื่อให้ระบบโทรออกอัตโนมัติเมื่อเกิดเหตุ"}
                  </Text>
                </View>
              }
            />

            {/* Floating Add Button - Hide if ReadOnly */}
            {!isReadOnly && (
              <View className="absolute bottom-8 left-6 right-6">
                <TouchableOpacity
                  onPress={() => router.push("/(features)/(emergency)/add")}
                  className="bg-[#16AD78] rounded-2xl py-4 flex-row justify-center items-center"
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{ fontSize: 18, fontWeight: "600" }}
                    className="font-kanit text-white"
                  >
                    เพิ่มเบอร์ติดต่อฉุกเฉิน
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}
