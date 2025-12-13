import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@/services/eventService";
import { getUserElders } from "@/services/userService";
import { Event } from "@/services/types";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Bounceable } from "@/components/Bounceable";

// ==========================================
// 🧩 LAYER: Logic (Helper Functions)
// Purpose: Format date for display
// ==========================================
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear() + 543;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day}/${month}/${year} เวลา ${time} น.`;
};




// ==========================================
// 📱 LAYER: View (Component)
// Purpose: History List Screen
// ==========================================
export default function HistoryScreen() {
  const router = useRouter();


  const [displayLimit, setDisplayLimit] = React.useState<number | null>(25); // 25, 50, or null (All)

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch and filter event history
  // ==========================================
  const {
    data: events,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["historyEvents"],
    queryFn: async () => {
      const elders = await getUserElders();
      if (!elders || elders.length === 0) {
        return [];
      }

      const elderId = elders[0].id;

      // Fetch a large batch to filter client-side
      const response = await listEvents({
        elderId: elderId,
        page: 1,
        pageSize: 100,
      });

      // Filter for specific event types
      const allowedTypes = ["FALL", "HEART_RATE_HIGH", "HEART_RATE_LOW"];
      const eventData = Array.isArray(response.data) ? response.data : [];
      const filteredEvents = eventData.filter((e) =>
        allowedTypes.includes(e.type)
      );

      return filteredEvents;
    },
    enabled: true,
  });

  const displayEvents = events || [];
  const limitedEvents = displayLimit
    ? displayEvents.slice(0, displayLimit)
    : displayEvents;
  const totalEvents = limitedEvents.length;

  // ==========================================
  // 🧩 LAYER: Logic (Presentation Logic)
  // Purpose: Determine display text/colors based on event type
  // ==========================================
  const getEventDisplayInfo = (item: Event) => {
    let icon: "warning" | "favorite" | "heart-broken" = "warning";
    let iconColor = "#EF4444";
    let bgColor = "#FEE2E2";
    let titleStatus = "ปกติ";
    let description = "เหตุการณ์ทั่วไป";
    let bpmText = item.value ? `${Math.round(item.value)} BPM` : "";

    switch (item.type) {
      case "FALL":
        icon = "warning";
        iconColor = "#EF4444";
        bgColor = "#FEE2E2";
        titleStatus = "ตรวจพบการหกล้ม";
        description = "พบเหตุการณ์หกล้ม กรุณาตรวจสอบ";
        break;
      case "HEART_RATE_HIGH":
        icon = "favorite";
        iconColor = "#F59E0B";
        bgColor = "#FEF3C7";
        titleStatus = "ชีพจรสูงกว่าปกติ";
        description = `ชีพจร ${bpmText}`;
        break;
      case "HEART_RATE_LOW":
        icon = "heart-broken";
        iconColor = "#3B82F6";
        bgColor = "#DBEAFE";
        titleStatus = "ชีพจรต่ำกว่าปกติ";
        description = `ชีพจร ${bpmText}`;
        break;
      default:
        description = item.type;
    }

    return { icon, iconColor, bgColor, titleStatus, description, bpmText };
  };

  // ==========================================
  // 🖼️ LAYER: View (Sub-Component)
  // Purpose: Render individual list item
  // ==========================================
  const renderItem = ({ item, index }: { item: Event; index: number }) => {
    const { icon, iconColor, bgColor, titleStatus, description } =
      getEventDisplayInfo(item);
    const displayIndex = totalEvents - index;

    return (
      <View className="mb-4 bg-white rounded-[24px] border border-gray-100">
        <View className="rounded-[24px] overflow-hidden">
          {/* Number Badge */}
          <View className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 items-center justify-center z-10">
            <Text
              style={{ fontSize: 14, fontWeight: "700" }}
              className="font-kanit text-gray-600"
            >
              {displayIndex}
            </Text>
          </View>

          {/* Icon Header */}
          <View
            className="flex-row items-center p-4"
            style={{ backgroundColor: bgColor }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: "white" }}
            >
              <MaterialIcons name={icon} size={24} color={iconColor} />
            </View>
            <View className="flex-1 ml-3">
              <Text
                style={{ fontSize: 16, fontWeight: "600" }}
                className="font-kanit text-gray-900"
              >
                {titleStatus}
              </Text>
              <Text
                style={{ fontSize: 12 }}
                className="font-kanit text-gray-600 mt-0.5"
              >
                {formatDate(item.timestamp)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="px-4 py-3 border-t border-gray-100">
            <Text
              style={{ fontSize: 14, lineHeight: 20 }}
              className="font-kanit text-gray-700"
            >
              {description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isError) {
    return (
      <ScreenWrapper
        edges={["top"]}
        useScrollView={false}
        keyboardAvoiding={false}
        style={{ backgroundColor: "#FFFFFF" }}
        header={
          <ScreenHeader
            title="ประวัติเหตุการณ์"
          />
        }
      >
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="error-outline" size={64} color="#D1D5DB" />
          <Text
            style={{ fontSize: 18 }}
            className="font-kanit text-gray-700 mt-4 text-center"
          >
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 bg-gray-200 px-6 py-3 rounded-xl"
          >
            <Text className="font-kanit text-gray-700">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the main UI
  // ==========================================
  return (
    <ScreenWrapper
      edges={["top"]}
      useScrollView={false}
      keyboardAvoiding={false}
      style={{ backgroundColor: "#FFFFFF" }}
      header={
        <ScreenHeader
          title="ประวัติเหตุการณ์"
        />
      }
    >
      <View className="flex-1 px-4 pt-4">
        {/* Navigation & Filter Card - Matches Settings Section */}
        <View className="bg-white rounded-[24px] shadow-lg shadow-black/15 android:elevation-10 mb-4">
          <View className="rounded-[24px] overflow-hidden border border-gray-100">
            {/* Report Summary Link */}
            <Bounceable
              className="p-5 border-b border-gray-100 active:bg-gray-50"
              onPress={() => router.push("/(features)/(monitoring)/report-summary")}
              scale={1}
              style={{ backgroundColor: "white" }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                    <MaterialIcons name="assessment" size={22} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontSize: 16, fontWeight: "500" }}
                      className="font-kanit text-gray-900"
                    >
                      ดูรายงานสรุปประจำเดือน
                    </Text>
                    <Text style={{ fontSize: 12 }} className="font-kanit text-gray-400">
                      สรุปสถิติเหตุการณ์แต่ละเดือน
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </View>
            </Bounceable>

            {/* Event Count & Filter */}
            <View className="p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ fontSize: 14 }} className="font-kanit text-gray-500">
                  {`แสดง ${totalEvents} จาก ${displayEvents.length} เหตุการณ์`}
                </Text>
              </View>

              {/* Limit Filter Chips */}
              <View className="flex-row items-center">
                <Text
                  style={{ fontSize: 14 }}
                  className="font-kanit text-gray-600 mr-3"
                >
                  แสดง:
                </Text>
                <View className="flex-row gap-2">
                  {[25, 50, null].map((limit) => {
                    const isSelected = displayLimit === limit;
                    const label = limit === null ? "ทั้งหมด" : `${limit}`;

                    return (
                      <Bounceable
                        key={limit?.toString() || "all"}
                        onPress={() => setDisplayLimit(limit)}
                        className={`px-4 py-2 rounded-full ${isSelected ? "bg-[#16AD78]" : "bg-gray-100"
                          }`}
                        scale={0.97}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                          className={`font-kanit ${isSelected ? "text-white" : "text-gray-700"
                            }`}
                        >
                          {label}
                        </Text>
                      </Bounceable>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16AD78" />
            <Text className="font-kanit text-gray-500 mt-4">
              กำลังโหลดข้อมูล...
            </Text>
          </View>
        ) : (
          <FlatList
            data={limitedEvents}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={["#16AD78"]}
              />
            }
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            ListEmptyComponent={
              <View className="mt-20 items-center">
                <MaterialIcons name="event-note" size={64} color="#D1D5DB" />
                <Text
                  style={{ fontSize: 16 }}
                  className="font-kanit text-gray-400 mt-4"
                >
                  ไม่มีประวัติเหตุการณ์ผิดปกติ
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
