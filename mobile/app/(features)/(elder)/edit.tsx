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
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { TextInput as PaperTextInput, useTheme } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserElders } from "@/services/userService";
import { updateElder } from "@/services/elderService";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { GenderSelect } from "@/components/GenderSelect";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ThaiAddressAutocomplete,
  AddressData,
} from "@/components/ThaiAddressAutocomplete";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Elder Profile Screen
// ==========================================
export default function EditElderInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const scrollViewRef = useRef<any>(null);
  // Keyboard listener removed to allow always-scroll

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

  const isReadOnly = !elder || (elder.accessLevel !== 'OWNER' && elder.accessLevel !== 'EDITOR');

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (elder) {
      setFirstName(elder.firstName || "");
      setLastName(elder.lastName || "");
      setGender(elder.gender || "");

      if (elder.dateOfBirth) {
        setDateOfBirth(new Date(elder.dateOfBirth));
      }

      setHeight(elder.height ? elder.height.toString() : "");
      setWeight(elder.weight ? elder.weight.toString() : "");
      setMedicalCondition(elder.diseases ? elder.diseases.join(", ") : "");
      setHouseNumber(elder.houseNumber || "");
      setVillage(elder.village || "");

      // Parse address from backend format
      if (
        elder.subdistrict &&
        elder.district &&
        elder.province &&
        elder.zipcode
      ) {
        setAddress({
          district: elder.subdistrict,
          amphoe: elder.district,
          province: elder.province,
          zipcode: elder.zipcode,
        });
      }
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
    if (isReadOnly) return;

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

    const payload = {
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

    updateMutation.mutate(payload);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // If read only, ignore
    if (isReadOnly) return;

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
      contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: true, // Allow bounce for better UX
        overScrollMode: "always",
        // scrollEnabled: true by default
      }}
      scrollViewRef={scrollViewRef}
      header={
        <View>
          <ScreenHeader
            title={isReadOnly ? "ข้อมูลผู้สูงอายุ" : "แก้ไขข้อมูลผู้สูงอายุ"}
            onBack={() => router.back()}
          />
          <View className="px-6 pb-2 bg-white">
            {isReadOnly ? (
              <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 flex-row items-center">
                <MaterialIcons name="lock" size={20} color="#CA8A04" style={{ marginRight: 8 }} />
                <Text className="font-kanit text-yellow-700 flex-1" style={{ fontSize: 14 }}>
                  คุณอยู่ในสถานะ "ดูได้อย่างเดียว" ไม่สามารถแก้ไขข้อมูลได้ กรุณาติดต่อญาติผู้ดูแลหลักหากต้องการเปลี่ยนแปลง
                </Text>
              </View>
            ) : (
              <View className="bg-blue-50 rounded-2xl p-4">
                <Text className="font-kanit text-blue-700" style={{ fontSize: 14 }}>
                  ปรับข้อมูลผู้สูงอายุให้เป็นปัจจุบัน
                  เพื่อช่วยให้การติดตามและแจ้งเตือนแม่นยำ
                </Text>
              </View>
            )}
          </View>
        </View>
      }
    >
      <View className="flex-1 pt-6">

        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6" style={{ opacity: isReadOnly ? 0.8 : 1 }} pointerEvents={isReadOnly ? 'none' : 'auto'}>
          {/* Elder Name & Lastname - FloatingLabelInput Match Register */}
          <View className="flex-row gap-3 mb-5">
            {/* First Name */}
            <View className="flex-1">
              <FloatingLabelInput
                label="ชื่อ"
                value={firstName}
                onChangeText={setFirstName}
                isRequired={true}
                editable={!isReadOnly}
              />
            </View>

            {/* Last Name */}
            <View className="flex-1">
              <FloatingLabelInput
                label="นามสกุล"
                value={lastName}
                onChangeText={setLastName}
                isRequired={true}
                editable={!isReadOnly}
              />
            </View>
          </View>

          {/* Gender - Replaced with Reusable Component */}
          {/* We might need to make GenderSelect support readonly/disabled prop, or just pointerEvents='none' handles it */}
          <View className="mb-5">
            <GenderSelect value={gender} onChange={setGender} isRequired={true} />
          </View>

          {/* Birth Date - Using Theme Colors */}
          <View className="mb-5">
            <TouchableOpacity
              onPress={() => !isReadOnly && setShowDatePicker(true)}
              className="bg-white rounded-2xl px-4 justify-center"
              style={{ height: 60, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: isReadOnly ? '#F3F4F6' : 'white' }}
              disabled={isReadOnly}
            >
              {dateOfBirth ? (
                <View className={`absolute -top-2.5 left-3 px-1 z-10 ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}>
                  <Text
                    className="font-kanit"
                    style={{ fontSize: 12, color: "#a3a6af" }}
                  >
                    วัน/เดือน/ปีเกิด <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                </View>
              ) : null}
              <Text
                className="font-kanit text-[16px]"
                style={{
                  color: dateOfBirth ? theme.colors.onSurface : "#a3a6af",
                }}
              >
                {dateOfBirth ? (
                  formatDate(dateOfBirth)
                ) : (
                  <>
                    วัน/เดือน/ปีเกิด <Text style={{ color: "#EF4444" }}>*</Text>
                  </>
                )}
              </Text>

              <View className="absolute right-4 top-5">
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#a3a6af"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Height and Weight - FloatingLabelInput Match Register */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <FloatingLabelInput
                label="ส่วนสูง (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                isRequired={true}
                editable={!isReadOnly}
              />
            </View>
            <View className="flex-1">
              <FloatingLabelInput
                label="น้ำหนัก (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                isRequired={true}
                editable={!isReadOnly}
              />
            </View>
          </View>

          {/* Medical Condition - Changed to Single Line as requested */}
          <View className="mb-5">
            <FloatingLabelInput
              label="โรคประจำตัว หรือ เคยป่วย (ถ้ามี)"
              value={medicalCondition}
              onChangeText={setMedicalCondition}
              editable={!isReadOnly}
            />
          </View>

          {/* House Number and Village */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <FloatingLabelInput
                label="บ้านเลขที่"
                value={houseNumber}
                onChangeText={setHouseNumber}
                editable={!isReadOnly}
                isRequired={true}
              />
            </View>
            <View className="flex-1">
              <FloatingLabelInput
                label="หมู่ที่/หมู่บ้าน"
                value={village}
                onChangeText={setVillage}
                editable={!isReadOnly}
                isRequired={true}
              />
            </View>
          </View>

          {/* Address - Autocomplete Search */}
          <View>
            <ThaiAddressAutocomplete
              value={address}
              onChange={setAddress}
              isRequired
            // Need to pass editable or similar prop if component supports it, otherwise View pointerEvents handles it
            />
          </View>
        </View>

        {/* Save Button - Hide if Read Only */}
        {!isReadOnly && (
          <View className="mt-2 mb-8">
            <PrimaryButton
              title="บันทึกข้อมูล"
              onPress={handleSave}
              loading={updateMutation.isPending}
            />
          </View>
        )}
      </View>

      {/* Date Picker Modal (iOS) or standard (Android) */}
      {!isReadOnly && Platform.OS === "ios" ? (
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
