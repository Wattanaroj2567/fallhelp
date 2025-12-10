import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import {
  createElder,
  updateElder,
  deleteElder,
  CreateElderPayload,
} from "@/services/elderService";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/utils/logger";
import { GenderSelect } from "@/components/GenderSelect";
import { useTheme } from "react-native-paper";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import DateTimePicker from "@react-native-community/datetimepicker";

const FORM_STORAGE_KEY = "setup_step1_form_data";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 1 of Setup - Elder Information
// ==========================================
export default function Step1() {
  const router = useRouter();
  const theme = useTheme();
  // Removed manual scroll refs as ScreenWrapper handles it

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // showGenderPicker removed - using GenderSelect component

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [address, setAddress] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // ==========================================
  // 💾 LAYER: Logic (Persistence)
  // Purpose: Save and load form data
  // ==========================================
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Check if we already have an elderId saved (means we're returning from step2)
        let existingElderId = await SecureStore.getItemAsync("setup_elderId");
        if (existingElderId === "undefined" || existingElderId === "null") {
          existingElderId = null;
        }
        Logger.debug("Step 1 loadFormData: existingElderId =", existingElderId);

        const savedData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFirstName(
            parsed.firstName || (parsed.name ? parsed.name.split(" ")[0] : "")
          );
          setLastName(
            parsed.lastName ||
            (parsed.name ? parsed.name.split(" ").slice(1).join(" ") : "")
          );
          setGender(parsed.gender || "");
          setDateOfBirth(
            parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null
          );
          setHeight(parsed.height || "");
          setWeight(parsed.weight || "");
          setMedicalCondition(parsed.medicalCondition || "");
          setAddress(parsed.address || "");

          if (existingElderId) {
            setInitialData(parsed);
            Logger.debug("Step 1: Set initialData for existing elder");
          } else {
            Logger.debug("Step 1: No elderId, will create new elder");
          }
        }
      } catch (error) {
        Logger.error("Failed to load form data:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFormData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saveFormData = async () => {
      try {
        const dataToSave = {
          firstName,
          lastName,
          gender,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
          height,
          weight,
          medicalCondition,
          address,
        };
        await AsyncStorage.setItem(
          FORM_STORAGE_KEY,
          JSON.stringify(dataToSave)
        );
      } catch (error) {
        Logger.error("Failed to save form data:", error);
      }
    };
    const timeoutId = setTimeout(saveFormData, 500);
    return () => clearTimeout(timeoutId);
  }, [
    firstName,
    lastName,
    gender,
    dateOfBirth,
    height,
    weight,
    medicalCondition,
    address,
    isLoaded,
  ]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Create or Update elder profile
  // ==========================================
  const saveElderMutation = useMutation({
    mutationFn: async (data: CreateElderPayload) => {
      let existingElderId = await SecureStore.getItemAsync("setup_elderId");

      // Check for invalid values stored as strings
      if (existingElderId === "undefined" || existingElderId === "null") {
        existingElderId = null;
        // Clean up invalid data
        await SecureStore.deleteItemAsync("setup_elderId");
      }

      if (existingElderId) {
        // Update existing elder
        Logger.info("Updating existing elder:", existingElderId);
        return await updateElder(existingElderId, data);
      } else {
        // Create new elder
        Logger.info("Creating new elder");
        return await createElder(data);
      }
    },
    onSuccess: async (elder) => {
      // 1. Save Elder ID (if not already saved)
      await SecureStore.setItemAsync("setup_elderId", String(elder.id));

      // 2. Set Setup Step to 2
      await SecureStore.setItemAsync("setup_step", "2");

      // Navigate to Step 2
      router.push("/(setup)/step2-device-pairing");
    },
    onError: (error: any) => {
      Logger.error("Error saving elder:", error);
      Alert.alert("ข้อผิดพลาด", error.message || "ไม่สามารถบันทึกข้อมูลได้");
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Validate and submit form
  // ==========================================
  const handleNext = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อผู้สูงอายุ");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกนามสกุลผู้สูงอายุ");
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

    const currentData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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

    // Check if data is unchanged and we have an existing elderId
    const existingElderId = await SecureStore.getItemAsync("setup_elderId");
    if (
      existingElderId &&
      existingElderId !== "undefined" &&
      existingElderId !== "null" &&
      initialData
    ) {
      // Reconstruct initial data
      const initialDataFormatted = {
        firstName:
          initialData.firstName ||
          (initialData.name ? initialData.name.split(" ")[0] : ""),
        lastName:
          initialData.lastName ||
          (initialData.name
            ? initialData.name.split(" ").slice(1).join(" ")
            : ""),
        gender: initialData.gender,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString()
          : null,
        height: Number(initialData.height),
        weight: Number(initialData.weight),
        diseases: initialData.medicalCondition
          ? initialData.medicalCondition
            .split(",")
            .map((d: string) => d.trim())
            .filter((d: string) => d)
          : [],
        address: initialData.address?.trim(),
      };

      if (
        JSON.stringify(currentData) === JSON.stringify(initialDataFormatted)
      ) {
        Logger.debug("Data unchanged, skipping update");
        await SecureStore.setItemAsync("setup_step", "2");
        router.push("/(setup)/step2-device-pairing");
        return;
      }
    }

    saveElderMutation.mutate(currentData);
  };

  const handleBack = async () => {
    try {
      // Auto-Delete Elder: Undo Step 1 if user goes back to empty state
      const elderId = await SecureStore.getItemAsync("setup_elderId");
      if (elderId) {
        try {
          await deleteElder(elderId);
          Logger.info("Auto-deleted elder on back to empty state:", elderId);
        } catch (deleteError) {
          // Ignore delete errors (e.g. 500 if not owner, or network fail)
          // We just want to clear local state and return to empty state
          Logger.warn("Could not auto-delete elder (ignoring):", deleteError);
        }

        // Always clear local storage if we had an elderId
        await SecureStore.deleteItemAsync("setup_elderId");
        await AsyncStorage.removeItem(FORM_STORAGE_KEY);
      }
    } catch (error) {
      Logger.error("Failed to handle back navigation cleanup:", error);
    }
    router.replace("/(setup)/empty-state");
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

  if (!isLoaded) {
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
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      edges={["top", "left", "right"]}
      scrollViewProps={{
        bounces: false,
        overScrollMode: "never",
      }}
    >
      {/* Header - Matched Register Screen */}
      <ScreenHeader title="ข้อมูลผู้สูงอายุ" onBack={handleBack} />

      {/* Progress Bar */}
      <View className="px-6 pb-4 mb-4">
        <View className="relative">
          {/* Connecting Line (Background) */}
          <View
            className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-gray-200"
            style={{ zIndex: 0 }}
          />
          {/* Active Line (None for Step 1 start) */}

          {/* Steps (Foreground) */}
          <View className="flex-row justify-between">
            {/* Step 1 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center z-10 mb-2 shadow-sm border border-blue-400">
                <Text
                  style={{ fontSize: 14, fontWeight: "600" }}
                  className="text-white font-kanit"
                >
                  1
                </Text>
              </View>
              <Text
                style={{ fontSize: 12 }}
                className="text-blue-600 text-center font-kanit"
              >
                กรอกข้อมูล{"\n"}ผู้สูงอายุ
              </Text>
            </View>

            {/* Step 2 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 items-center justify-center z-10 mb-2">
                <Text
                  style={{ fontSize: 14, fontWeight: "600" }}
                  className="text-gray-400 font-kanit"
                >
                  2
                </Text>
              </View>
              <Text
                style={{ fontSize: 12 }}
                className="text-gray-400 text-center font-kanit"
              >
                ติดตั้งอุปกรณ์
              </Text>
            </View>

            {/* Step 3 */}
            <View className="flex-1 items-center">
              <View className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 items-center justify-center z-10 mb-2">
                <Text
                  style={{ fontSize: 14, fontWeight: "600" }}
                  className="text-gray-400 font-kanit"
                >
                  3
                </Text>
              </View>
              <Text
                style={{ fontSize: 12 }}
                className="text-gray-400 text-center font-kanit"
              >
                ตั้งค่า WiFi
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1">
        {/* Info Note */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 mt-6">
          <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
            เพื่อให้เป็นข้อมูลส่วนตัวของคุณในการติดตามผู้สูงอายุและเพิ่มเติม
          </Text>
        </View>

        {/* Elder Name & Lastname */}
        <View className="flex-row gap-3">
          {/* First Name */}
          <FloatingLabelInput
            label="ชื่อ *"
            value={firstName}
            onChangeText={setFirstName}
            containerStyle={{ flex: 1 }}
          />
          {/* Last Name */}
          <FloatingLabelInput
            label="นามสกุล *"
            value={lastName}
            onChangeText={setLastName}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Gender */}
        <GenderSelect value={gender} onChange={setGender} isRequired={true} />

        {/* Birth Date - Using Theme Colors */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-2xl px-4 justify-center"
            style={{ height: 60, borderWidth: 1, borderColor: "#E5E7EB" }}
          >
            {dateOfBirth ? (
              <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                <Text
                  className="font-kanit"
                  style={{ fontSize: 12, color: "#a3a6af" }}
                >
                  วัน/เดือน/ปีเกิด{" "}
                  <Text style={{ color: theme.colors.error }}>*</Text>
                </Text>
              </View>
            ) : null}
            <Text
              className="font-kanit text-[16px]"
              style={{
                color: dateOfBirth ? theme.colors.onSurface : "#a3a6af",
              }}
            >
              {formatDate(dateOfBirth)}
              {!dateOfBirth && " *"}
            </Text>

            <View className="absolute right-4 top-5">
              <MaterialIcons name="calendar-today" size={20} color="#a3a6af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Height and Weight */}
        <View className="flex-row gap-3 mb-2">
          <View className="flex-1">
            <FloatingLabelInput
              label="ส่วนสูง (cm) *"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <FloatingLabelInput
              label="น้ำหนัก (kg) *"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Medical Condition - Single line */}
        <FloatingLabelInput
          label="โรคประจำตัว หรือ เคยป่วย (ถ้ามี)"
          value={medicalCondition}
          onChangeText={setMedicalCondition}
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Address - Multiline */}
        <FloatingLabelInput
          label="ที่อยู่ *"
          value={address}
          onChangeText={setAddress}
          multiline
          containerStyle={{ marginBottom: 24, minHeight: 120 }}
          style={{ maxHeight: 120 }}
        />

        {/* Next Button */}
        <PrimaryButton
          title="ถัดไป"
          onPress={handleNext}
          loading={saveElderMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>

      {/* GenderPickerModal Removed */}

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
