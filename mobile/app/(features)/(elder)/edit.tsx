import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserElders } from "@/services/userService";
import { updateElder } from "@/services/elderService";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import DateTimePicker from "@react-native-community/datetimepicker";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Elder Profile Screen
// ==========================================
export default function EditElderInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Scroll logic removed for static layout request


  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [address, setAddress] = useState("");

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder data
  // ==========================================
  const { data: elder, isLoading: isFetching } = useQuery({
    queryKey: ["userElders"],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (elder) {
      setName(`${elder.firstName} ${elder.lastName}`.trim());
      setGender(elder.gender || "");

      if (elder.dateOfBirth) {
        setDateOfBirth(new Date(elder.dateOfBirth));
      }

      setHeight(elder.height ? elder.height.toString() : "");
      setWeight(elder.weight ? elder.weight.toString() : "");
      setMedicalCondition(elder.diseases ? elder.diseases.join(", ") : "");
      setAddress(elder.address || "");
    }
  }, [elder]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update elder profile
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!elder?.id) throw new Error("No elder ID");
      return await updateElder(elder.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userElders"] });
      Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Logger.error("Update failed:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อผู้สูงอายุ");
      return;
    }
    if (!gender) {
      Alert.alert("กรุณาเลือกข้อมูล", "กรุณาเลือกเพศ");
      return;
    }
    if (!dateOfBirth) {
      Alert.alert("กรุณาเลือกข้อมูล", "กรุณาระบุวันเกิด");
      return;
    }

    // Validate Age (Must be 55+)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 55) {
      Alert.alert(
        "อายุไม่ถึงเกณฑ์",
        "ผู้สูงอายุต้องมีอายุ 55 ปีขึ้นไป กรุณาตรวจสอบปีเกิดอีกครั้ง"
      );
      return;
    }

    // Validate Height (Required)
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกส่วนสูงให้ถูกต้อง");
      return;
    }

    // Validate Weight (Required)
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกน้ำหนักให้ถูกต้อง");
      return;
    }

    // Validate Address (Required)
    if (!address.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกที่อยู่");
      return;
    }

    const payload = {
      firstName: name.split(" ")[0] || name,
      lastName: name.split(" ").slice(1).join(" ") || "",
      gender: gender as "MALE" | "FEMALE" | "OTHER",
      dateOfBirth: dateOfBirth.toISOString(),
      height: Number(height),
      weight: Number(weight),
      diseases: medicalCondition
        ? medicalCondition
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d)
        : [],
      address: address.trim(),
    };

    updateMutation.mutate(payload);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth || new Date();
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    setDateOfBirth(currentDate);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "วัน/เดือน/ปีเกิด";
    const day = date.getDate();
    const month = date.toLocaleDateString("th-TH", { month: "long" });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const GenderPickerModal = () => (
    <Modal
      transparent={true}
      visible={showGenderPicker}
      animationType="fade"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={() => setShowGenderPicker(false)}
      >
        <View className="bg-white w-full rounded-2xl p-4">
          <Text className="font-kanit text-lg font-bold mb-4 text-center">
            เลือกเพศ
          </Text>
          {["ชาย", "หญิง", "อื่นๆ"].map((optionLabel) => {
            const value =
              optionLabel === "ชาย"
                ? "MALE"
                : optionLabel === "หญิง"
                  ? "FEMALE"
                  : "OTHER";
            return (
              <TouchableOpacity
                key={value}
                className="py-4 border-b border-gray-100"
                onPress={() => {
                  setGender(value);
                  setShowGenderPicker(false);
                }}
              >
                <Text
                  className={`font-kanit text-center text-base ${gender === value
                    ? "text-[#16AD78] font-bold"
                    : "text-gray-700"
                    }`}
                >
                  {optionLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16AD78" />
      </View>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <ScreenWrapper
      useScrollView={false}
      contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
    >
      {/* Header align with Step1 */}
      <ScreenHeader title="ข้อมูลผู้สูงอายุ" onBack={() => router.back()} />

      <View
        className="flex-1 px-6"
      >
        {/* Info Note */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-2">
          <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
            ปรับข้อมูลผู้สูงอายุให้เป็นปัจจุบัน
            เพื่อช่วยให้การติดตามและแจ้งเตือนแม่นยำ
          </Text>
        </View>

        {/* Elder Name */}
        <View
          className="mb-4"
        >
          <FloatingLabelInput
            label="ชื่อผู้สูงอายุ *"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Gender */}
        <View className="mb-4">
          <View style={{ height: 60 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowGenderPicker(true)}
              className="h-full justify-center rounded-2xl border border-gray-200 px-4 bg-white relative"
            >
              {gender ? (
                <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                  <Text
                    className="font-kanit"
                    style={{ fontSize: 12, color: "#9CA3AF" }}
                  >
                    เพศ <Text className="text-red-500">*</Text>
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center">
                <Text
                  className={`font-kanit text-[16px] ${gender ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  {gender === "MALE"
                    ? "ชาย"
                    : gender === "FEMALE"
                      ? "หญิง"
                      : gender === "OTHER"
                        ? "อื่นๆ"
                        : "เพศ *"}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color="#6B7280"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birth Date */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-2xl px-4 border border-gray-200 justify-center"
            style={{ height: 60 }}
          >
            {dateOfBirth ? (
              <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                <Text
                  className="font-kanit"
                  style={{ fontSize: 12, color: "#9CA3AF" }}
                >
                  วัน/เดือน/ปีเกิด <Text className="text-red-500">*</Text>
                </Text>
              </View>
            ) : null}
            <Text
              className={`font-kanit text-[16px] ${dateOfBirth ? "text-gray-900" : "text-gray-400"
                }`}
            >
              {formatDate(dateOfBirth)}
              {!dateOfBirth && " *"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height and Weight */}
        <View
          className="flex-row mb-4"
        >
          <View className="flex-1 mr-2">
            <FloatingLabelInput
              label="ส่วนสูง (cm) *"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 ml-2">
            <FloatingLabelInput
              label="น้ำหนัก (kg) *"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Medical Condition */}
        <View
          className="mb-4"
        >
          <FloatingLabelInput
            label="โรคประจำตัว หรือ เคยป่วย (ถ้ามี)"
            value={medicalCondition}
            onChangeText={setMedicalCondition}
            multiline
            numberOfLines={3}
            style={{ minHeight: 120, textAlignVertical: "top", paddingTop: 18 }}
            containerStyle={{ minHeight: 120 }}
          />
        </View>

        {/* Address */}
        <View
          className="mb-6"
        >
          <FloatingLabelInput
            label="ที่อยู่ *"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={4}
            style={{ minHeight: 140, textAlignVertical: "top", paddingTop: 18 }}
            containerStyle={{ minHeight: 140 }}
          />
        </View>

        {/* Save Button */}
        <PrimaryButton
          title="บันทึกข้อมูล"
          onPress={handleSave}
          loading={updateMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>

      <GenderPickerModal />

      {/* Date Picker Modal (iOS) or standard (Android) */}
      {Platform.OS === "ios" ? (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              className="bg-white pb-6 rounded-t-3xl"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <Text className="font-kanit text-lg font-bold">
                  เลือกวันเกิด
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="font-kanit text-blue-600 text-lg font-bold">
                    เสร็จสิ้น
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateOfBirth || new Date()}
                maximumDate={new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                locale="th-TH"
                textColor="#000000"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            maximumDate={new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </ScreenWrapper>
  );
}
