import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUserElders } from "@/services/userService";
import { listEvents } from "@/services/eventService";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";

// ==========================================
// 🧩 LAYER: Logic (Types)
// Purpose: Define summary data structure
// ==========================================
interface MonthlySummary {
  month: string;
  year: number;
  peakTimeRange: string;
  totalFallEvents: number;
  heartRateAnomalies: {
    high: number;
    low: number;
  };
}

const THAI_MONTHS = [
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

// ==========================================
// 🎨 LAYER: Mock Data (for UI Preview)
// ==========================================
const MOCK_SUMMARY: MonthlySummary = {
  month: "มกราคม",
  year: 2568,
  peakTimeRange: "14:00 - 15:00 น.",
  totalFallEvents: 3,
  heartRateAnomalies: {
    high: 5,
    low: 2,
  },
};

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Monthly Report Summary Screen
// ==========================================
export default function ReportSummary() {
  const router = useRouter();

  // TODO: REMOVE IN PRODUCTION
  // This toggle is for UI preview during development only.
  const [useMockData, setUseMockData] = React.useState(false);

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage selected month/year
  // ==========================================
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear() + 543
  ); // พ.ศ.
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder
  // ==========================================
  const { data: currentElder } = useQuery({
    queryKey: ["userElders"],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching & Processing)
  // Purpose: Fetch events and calculate summary
  // ==========================================
  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["monthlySummary", currentElder?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!currentElder?.id) return null;

      const yearAD = currentYear - 543;
      const startDate = new Date(yearAD, currentMonth, 1);
      const endDate = new Date(yearAD, currentMonth + 1, 0, 23, 59, 59);

      const response = await listEvents({
        elderId: currentElder.id,
        page: 1,
        pageSize: 500,
      });

      // Filter events for selected month
      const eventData = Array.isArray(response.data) ? response.data : [];
      const monthEvents = eventData.filter((event) => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
      });

      // Count events
      const fallEvents = monthEvents.filter((e) => e.type === "FALL").length;
      const hrHigh = monthEvents.filter(
        (e) => e.type === "HEART_RATE_HIGH"
      ).length;
      const hrLow = monthEvents.filter(
        (e) => e.type === "HEART_RATE_LOW"
      ).length;

      // Calculate peak time
      const hourCounts: { [key: number]: number } = {};
      monthEvents.forEach((event) => {
        const hour = new Date(event.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      let peakHour = 0;
      let maxCount = 0;
      Object.entries(hourCounts).forEach(([hour, count]) => {
        if (count > maxCount) {
          maxCount = count;
          peakHour = parseInt(hour);
        }
      });

      const peakTimeRange =
        maxCount > 0
          ? `${peakHour.toString().padStart(2, "0")}:00 - ${(
            (peakHour + 1) %
            24
          )
            .toString()
            .padStart(2, "0")}:00 น.`
          : "ไม่มีข้อมูล";

      return {
        month: THAI_MONTHS[currentMonth],
        year: currentYear,
        peakTimeRange,
        totalFallEvents: fallEvents,
        heartRateAnomalies: {
          high: hrHigh,
          low: hrLow,
        },
      } as MonthlySummary;
    },
    enabled: !!currentElder?.id && !useMockData,
  });

  const displaySummary = useMockData ? MOCK_SUMMARY : summary;

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle month navigation
  // ==========================================
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear() + 543;

    // Don't allow going beyond current month
    if (currentYear === todayYear && currentMonth === todayMonth) {
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return (
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear() + 543
    );
  };

  if (isError && !useMockData) {
    return (
      <ScreenWrapper
        edges={["top"]}
        useScrollView={false}
        style={{ backgroundColor: "#FFFFFF" }}
        header={
          <ScreenHeader
            title="รายงานสรุปประจำเดือน"
            onBack={() => router.back()}
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
          <TouchableHighlight
            onPress={() => refetch()}
            className="mt-4 px-6 py-3 rounded-xl"
            underlayColor="#E5E7EB"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <Text className="font-kanit text-gray-700">ลองใหม่</Text>
          </TouchableHighlight>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the report UI
  // ==========================================
  return (
    <ScreenWrapper
      edges={["top"]}
      useScrollView={false}
      style={{ backgroundColor: "#FFFFFF" }}
      header={
        <ScreenHeader
          title="รายงานสรุปประจำเดือน"
          onBack={() => router.back()}
          rightElement={
            <TouchableHighlight
              onPress={() => setUseMockData(!useMockData)}
              className="p-2 -mr-2 rounded-full"
              underlayColor="#E5E7EB"
            >
              <MaterialIcons
                name={useMockData ? "visibility" : "visibility-off"}
                size={28}
                color="#6B7280"
              />
            </TouchableHighlight>
          }
        />
      }
    >
      <View className="flex-1">
        <View className="p-6">
          {/* Month Selector - Improved */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableHighlight
              onPress={handlePreviousMonth}
              className="w-12 h-12 rounded-full overflow-hidden"
              underlayColor="#E5E7EB"
              style={{ borderRadius: 24 }}
            >
              <View className="w-12 h-12 items-center justify-center bg-gray-100">
                <MaterialIcons name="chevron-left" size={32} color="#374151" />
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              className="flex-1 mx-4 rounded-2xl overflow-hidden"
              onPress={() => setShowMonthPicker(true)}
              underlayColor="#E5E7EB"
              style={{ borderRadius: 16 }}
            >
              <View className="items-center">
                <View className="flex-row items-center bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200 w-full justify-center">
                  <Text
                    style={{ fontSize: 20, fontWeight: "600" }}
                    className="font-kanit text-gray-900"
                  >
                    {THAI_MONTHS[currentMonth]} {currentYear}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={28} color="#6B7280" />
                </View>
                {useMockData && (
                  <View className="bg-blue-50 px-3 py-1 rounded-full mt-2">
                    <Text
                      style={{ fontSize: 12 }}
                      className="font-kanit text-blue-600"
                    >
                      MOCK DATA
                    </Text>
                  </View>
                )}
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={handleNextMonth}
              disabled={isCurrentMonth()}
              className="w-12 h-12 rounded-full overflow-hidden"
              underlayColor="#E5E7EB"
              style={{ borderRadius: 24, opacity: isCurrentMonth() ? 0.4 : 1 }}
            >
              <View className="w-12 h-12 items-center justify-center bg-gray-100">
                <MaterialIcons name="chevron-right" size={32} color="#374151" />
              </View>
            </TouchableHighlight>
          </View>

          {isLoading && !useMockData ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#16AD78" />
              <Text
                style={{ fontSize: 14 }}
                className="font-kanit text-gray-600 mt-4"
              >
                กำลังโหลดข้อมูล...
              </Text>
            </View>
          ) : displaySummary ? (
            <>
              {/* Peak Time Card */}
              <View className="bg-white rounded-[24px] shadow-lg shadow-black/15 android:elevation-10 mb-4">
                <View className="rounded-[24px] overflow-hidden border border-gray-100 p-5 flex-row items-center">
                  <View className="w-14 h-14 rounded-2xl bg-teal-100 items-center justify-center mr-4">
                    <MaterialIcons name="schedule" size={28} color="#16AD78" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500 mb-1">
                      ช่วงเวลาเกิดเหตุบ่อยที่สุด
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: "600" }} className="font-kanit text-teal-600">
                      {displaySummary.peakTimeRange}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fall Events Card */}
              <View className="bg-white rounded-[24px] shadow-lg shadow-black/15 android:elevation-10 mb-4">
                <View className="rounded-[24px] overflow-hidden border border-gray-100 p-5 flex-row items-center">
                  <View className="w-14 h-14 rounded-2xl bg-orange-100 items-center justify-center mr-4">
                    <MaterialIcons name="warning" size={28} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500 mb-1">
                      เหตุการณ์หกล้ม
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text style={{ fontSize: 36, fontWeight: "700" }} className="font-kanit text-orange-500">
                        {displaySummary.totalFallEvents}
                      </Text>
                      <Text style={{ fontSize: 16 }} className="font-kanit text-gray-500 ml-2">
                        ครั้ง
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Heart Rate Card */}
              <View className="bg-white rounded-[24px] shadow-lg shadow-black/15 android:elevation-10 mb-4">
                <View className="rounded-[24px] overflow-hidden border border-gray-100 p-5">
                  <View className="flex-row items-center mb-4">
                    <View className="w-14 h-14 rounded-2xl bg-rose-100 items-center justify-center mr-4">
                      <MaterialIcons name="favorite" size={28} color="#E11D48" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "600" }} className="font-kanit text-gray-900">
                      ชีพจรผิดปกติ
                    </Text>
                  </View>
                  <View className="flex-row gap-4 ml-2">
                    {/* High HR */}
                    <View className="flex-1 bg-red-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        <MaterialIcons name="trending-up" size={20} color="#EF4444" />
                        <Text style={{ fontSize: 13 }} className="font-kanit text-red-600 ml-1">
                          สูงผิดปกติ
                        </Text>
                      </View>
                      <Text style={{ fontSize: 28, fontWeight: "700" }} className="font-kanit text-red-500">
                        {displaySummary.heartRateAnomalies.high}
                        <Text style={{ fontSize: 14 }} className="font-kanit text-red-400"> ครั้ง</Text>
                      </Text>
                    </View>
                    {/* Low HR */}
                    <View className="flex-1 bg-blue-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        <MaterialIcons name="trending-down" size={20} color="#3B82F6" />
                        <Text style={{ fontSize: 13 }} className="font-kanit text-blue-600 ml-1">
                          ต่ำผิดปกติ
                        </Text>
                      </View>
                      <Text style={{ fontSize: 28, fontWeight: "700" }} className="font-kanit text-blue-500">
                        {displaySummary.heartRateAnomalies.low}
                        <Text style={{ fontSize: 14 }} className="font-kanit text-blue-400"> ครั้ง</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Info Box */}
              <View className="bg-gray-50 rounded-2xl p-4 flex-row items-start">
                <MaterialIcons name="info-outline" size={20} color="#6B7280" />
                <Text style={{ fontSize: 13 }} className="font-kanit text-gray-500 flex-1 ml-2">
                  ข้อมูลนี้เป็นสรุปเหตุการณ์ทั้งหมดในเดือน {THAI_MONTHS[currentMonth]} {currentYear}
                </Text>
              </View>
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="description" size={80} color="#D1D5DB" />
              <Text
                style={{ fontSize: 18, fontWeight: "600" }}
                className="font-kanit text-gray-900 mt-4"
              >
                ไม่มีข้อมูลในเดือนนี้
              </Text>
              <Text
                style={{ fontSize: 14 }}
                className="font-kanit text-gray-500 mt-2 text-center px-6"
              >
                ยังไม่มีเหตุการณ์ที่บันทึกไว้ในเดือน{THAI_MONTHS[currentMonth]}{" "}
                {currentYear}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-3xl p-6 mx-6 w-80 max-h-96"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "700" }}
              className="font-kanit text-gray-900 mb-4 text-center"
            >
              เลือกเดือน/ปี
            </Text>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              {/* Generate last 24 months (2 years) */}
              {Array.from({ length: 24 }).map((_, index) => {
                const today = new Date();
                const targetDate = new Date(
                  today.getFullYear(),
                  today.getMonth() - index,
                  1
                );
                const month = targetDate.getMonth();
                const year = targetDate.getFullYear() + 543;
                const isSelected =
                  month === currentMonth && year === currentYear;

                return (
                  <TouchableOpacity
                    key={`${month}-${year}`}
                    onPress={() => {
                      setCurrentMonth(month);
                      setCurrentYear(year);
                      setShowMonthPicker(false);
                    }}
                    className={`py-3 px-4 rounded-xl mb-2 ${isSelected
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-gray-50"
                      }`}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                      className={`font-kanit text-center ${isSelected ? "text-green-600" : "text-gray-700"
                        }`}
                    >
                      {THAI_MONTHS[month]} {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowMonthPicker(false)}
              className="bg-gray-100 rounded-xl py-3"
              activeOpacity={0.6}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600" }}
                className="font-kanit text-gray-700 text-center"
              >
                ยกเลิก
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}
