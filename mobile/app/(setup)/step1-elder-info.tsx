import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
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
import { showErrorMessage } from "@/utils/errorHelper";
import { GenderSelect } from "@/components/GenderSelect";
import { useTheme } from "react-native-paper";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { WizardLayout } from "@/components/WizardLayout";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FloatingLabelDatePicker } from "@/components/FloatingLabelDatePicker";
import {
  ThaiAddressAutocomplete,
  AddressData,
} from "@/components/ThaiAddressAutocomplete";

const FORM_STORAGE_KEY = "setup_step1_form_data";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Step 1 of Setup - Elder Information
// ==========================================
export default function Step1() {
  const router = useRouter();
  const theme = useTheme();
  const scrollViewRef = useRef<any>(null);

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [village, setVillage] = useState("");
  const [address, setAddress] = useState<AddressData | null>(null);
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

        // Validate if elder actually exists on server (fix for Dev Mode/DB Wipes)
        if (existingElderId) {
          try {
            const { getElder } = require("@/services/elderService");
            await getElder(existingElderId);
            Logger.debug("Step 1 check: Elder ID exists on server", existingElderId);
          } catch (serverError) {
            Logger.warn("Step 1 check: Elder ID invalid or not found on server (clearing)", serverError);
            existingElderId = null; // Treat as new
            await SecureStore.deleteItemAsync("setup_elderId");
          }
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

          // Validate address format before setting
          const addr = parsed.address;
          if (
            addr &&
            addr.district &&
            addr.amphoe &&
            addr.province &&
            addr.zipcode
          ) {
            setAddress(addr);
          } else {
            setAddress(null); // Invalid or old format - clear it
          }

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
          houseNumber,
          village,
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
    houseNumber,
    village,
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
      Logger.error("Save elder error:", error);
      showErrorMessage("ข้อผิดพลาด", error);
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

    // Validate House Number (Required)
    if (!houseNumber.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกบ้านเลขที่");
      return;
    }

    // Validate Village (Required)
    if (!village.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกหมู่ที่/หมู่บ้าน");
      return;
    }

    // Validate Address (Required)
    if (!address || !address.district || !address.province) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณาเลือกที่อยู่");
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
      houseNumber: houseNumber.trim(),
      village: village.trim(),
      subdistrict: address.district,
      district: address.amphoe,
      province: address.province,
      zipcode: address.zipcode,
    };

    // Check if data is unchanged and we have an existing elderId
    const existingElderId = await SecureStore.getItemAsync("setup_elderId");
    if (
      existingElderId &&
      existingElderId !== "undefined" &&
      existingElderId !== "null"
    ) {
      // Elder already exists - check if data changed
      if (initialData) {
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
          houseNumber: initialData.houseNumber || "",
          village: initialData.village || "",
          subdistrict: initialData.address?.district || "",
          district: initialData.address?.amphoe || "",
          province: initialData.address?.province || "",
          zipcode: initialData.address?.zipcode || "",
        };

        if (
          JSON.stringify(currentData) === JSON.stringify(initialDataFormatted)
        ) {
          // Data unchanged, skip mutation and go directly to Step 2
          Logger.info("Data unchanged, skipping update and going to Step 2");
          await SecureStore.setItemAsync("setup_step", "2");
          router.push("/(setup)/step2-device-pairing");
          return;
        }
      } else {
        // No initialData loaded yet, but have elderId
        // This means user came back from Step 2 without loading
        // Safe to proceed to Step 2 without updating
        Logger.info("Elder exists but no initialData, proceeding to Step 2");
        await SecureStore.setItemAsync("setup_step", "2");
        router.push("/(setup)/step2-device-pairing");
        return;
      }
    }

    // Either no elder yet, or data changed - proceed with mutation
    saveElderMutation.mutate(currentData);
  };

  const handleBack = () => {
    // Simply go back to the welcome screen
    // We do NOT delete the elder here anymore, to avoid complex state issues and errors.
    // The previous logic caused crashes when navigating back.
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
    <WizardLayout
      currentStep={1}
      title="ข้อมูลผู้สูงอายุ"
      onBack={handleBack}
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      scrollViewProps={{
        bounces: false,
        overScrollMode: "never",
      }}
      scrollViewRef={scrollViewRef}
      headerExtra={
        <View className="bg-blue-50 rounded-2xl p-4 mb-2">
          <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
            เพื่อให้เป็นข้อมูลส่วนตัวของคุณในการติดตามผู้สูงอายุและเพิ่มเติม
          </Text>
        </View>
      }
    >
      <View className="flex-1 mt-4">
        {/* Form Fields */}
        <View className="mb-6">
          {/* Elder Name & Lastname */}
          <View className="flex-row gap-3">
            {/* First Name */}
            <View className="flex-1">
              <FloatingLabelInput
                label="ชื่อ"
                value={firstName}
                onChangeText={setFirstName}
                isRequired
              />
            </View>
            {/* Last Name */}
            <View className="flex-1">
              <FloatingLabelInput
                label="นามสกุล"
                value={lastName}
                onChangeText={setLastName}
                isRequired
              />
            </View>
          </View>

          {/* Gender */}
          <GenderSelect value={gender} onChange={setGender} isRequired={true} />

          {/* Birth Date */}
          <FloatingLabelDatePicker
            value={dateOfBirth}
            onChange={(date) => {
              // Close other inputs
              Keyboard.dismiss();
              setDateOfBirth(date);
            }}
            isRequired={true}
          />

          {/* Height and Weight */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FloatingLabelInput
                label="ส่วนสูง (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                isRequired
              />
            </View>
            <View className="flex-1">
              <FloatingLabelInput
                label="น้ำหนัก (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                isRequired
              />
            </View>
          </View>

          {/* Medical Condition - Single line */}
          <View>
            <FloatingLabelInput
              label="โรคประจำตัว หรือ เคยป่วย (ถ้ามี)"
              value={medicalCondition}
              onChangeText={setMedicalCondition}
            />
          </View>

          {/* House Number and Village */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FloatingLabelInput
                label="บ้านเลขที่"
                value={houseNumber}
                onChangeText={setHouseNumber}
                isRequired
              />
            </View>
            <View className="flex-1">
              <FloatingLabelInput
                label="หมู่ที่/หมู่บ้าน"
                value={village}
                onChangeText={setVillage}
                isRequired
              />
            </View>
          </View>

          {/* Address - Autocomplete Search */}
          <ThaiAddressAutocomplete
            value={address}
            onChange={setAddress}
            isRequired
          />
        </View>

        {/* Next Button */}
        <PrimaryButton
          title="ถัดไป"
          onPress={handleNext}
          loading={saveElderMutation.isPending}
          style={{ marginBottom: 32 }}
        />
      </View>
    </WizardLayout>
  );
}
