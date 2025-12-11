// components/ThaiAddressAutocomplete.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import thailandData from "@/assets/thailand-address.json";

interface ThailandAddress {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
}

const data: ThailandAddress[] = thailandData as ThailandAddress[];

export interface AddressData {
  houseNumber?: string;
  village?: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
}

interface ThaiAddressAutocompleteProps {
  value: AddressData | null;
  onChange: (address: AddressData) => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

export function ThaiAddressAutocomplete({
  value,
  onChange,
  placeholder = "ค้นหาที่อยู่โดยพิมพ์ตำบล, อำเภอ, จังหวัด หรือรหัสไปรษณีย์",
  isRequired = false,
  error,
}: ThaiAddressAutocompleteProps) {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter addresses based on debounced search query
  const filteredAddresses = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return [];
    }

    const query = debouncedQuery.toLowerCase();
    const results = data.filter((item) => {
      return (
        item.district.toLowerCase().includes(query) ||
        item.amphoe.toLowerCase().includes(query) ||
        item.province.toLowerCase().includes(query) ||
        String(item.zipcode).includes(query)
      );
    });

    // Limit to 50 results for performance
    return results.slice(0, 50);
  }, [debouncedQuery]);

  const handleOpen = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowModal(true);
  };

  const handleSelect = (address: ThailandAddress) => {
    onChange({
      district: address.district,
      amphoe: address.amphoe,
      province: address.province,
      zipcode: String(address.zipcode),
    });
    setShowModal(false);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const formatDisplayValue = () => {
    if (!value || !value.district) return placeholder;
    return `${value.district} » ${value.amphoe} » ${value.province} » ${value.zipcode}`;
  };

  const labelColor = error
    ? theme.colors.error
    : value?.district
      ? "#a3a6af"
      : "#a3a6af";

  const borderColor = error
    ? theme.colors.error
    : "#E5E7EB"; // Always gray unless error (as per user request)

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={handleOpen}
        className="bg-white rounded-2xl px-4 justify-center"
        style={{
          borderWidth: 1,
          borderColor: borderColor,
          height: 56,
        }}
      >
        {/* Floating Label (Simulated) */}
        <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
          <Text
            className="font-kanit"
            style={{
              fontSize: 12,
              color: error ? theme.colors.error : "#a3a6af"
            }}
          >
            ค้นหาที่อยู่ {isRequired && <Text className="text-red-500">*</Text>}
          </Text>
        </View>

        {/* Input Text / Placeholder */}
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 font-kanit text-[16px] mr-2"
            style={{
              color: value?.district ? theme.colors.onSurface : "#a3a6af", // Gray if placeholder
            }}
            numberOfLines={1}
          >
            {formatDisplayValue()}
          </Text>
          <MaterialIcons name="search" size={24} color="#a3a6af" />
        </View>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text className="font-kanit text-xs text-red-500 mt-1 ml-1">{error}</Text>
      )}

      {/* Search Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={handleClose}
          >
            <Pressable
              className="bg-white rounded-t-[20px] max-h-[90%] pb-5"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <Text className="font-kanit text-lg font-semibold text-gray-700">
                  ค้นหาที่อยู่ของคุณ
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View className="flex-row items-center mx-4 my-2 px-3 py-2.5 bg-gray-100 rounded-xl">
                <MaterialIcons name="search" size={20} color="#a3a6af" />
                <TextInput
                  className="flex-1 font-kanit text-base ml-2 text-gray-700"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={placeholder}
                  placeholderTextColor="#a3a6af"
                  autoFocus
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <MaterialIcons name="close" size={20} color="#a3a6af" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Search Hint */}
              {searchQuery.length < 2 && (
                <View className="flex-row items-center px-4 py-2 gap-1.5">
                  <MaterialIcons
                    name="info-outline"
                    size={16}
                    color="#a3a6af"
                  />
                  <Text className="font-kanit text-sm text-gray-400">
                    พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                  </Text>
                </View>
              )}

              {/* Results List */}
              <FlatList
                data={filteredAddresses}
                keyExtractor={(item, index) =>
                  `${item.district}-${item.amphoe}-${item.province}-${index}`
                }
                className="max-h-[500px]"
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-3.5 border-b border-gray-100"
                    onPress={() => handleSelect(item)}
                  >
                    <View className="flex-1">
                      <Text className="font-kanit text-[15px] leading-[22px]">
                        <Text className="font-semibold text-gray-700">
                          {item.district}
                        </Text>
                        {" » "}
                        <Text className="text-gray-500">{item.amphoe}</Text>
                        {" » "}
                        <Text className="text-gray-500">{item.province}</Text>
                        {" » "}
                        <Text className="font-medium text-[#16AD78]">
                          {item.zipcode}
                        </Text>
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color="#a3a6af"
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  debouncedQuery.length >= 2 ? (
                    <View className="py-12 items-center">
                      <MaterialIcons
                        name="search-off"
                        size={48}
                        color="#E5E7EB"
                      />
                      <Text className="font-kanit text-base text-gray-500 mt-3 mb-1">
                        ไม่พบที่อยู่ที่ค้นหา
                      </Text>
                      <Text className="font-kanit text-sm text-gray-400 text-center">
                        ลองค้นหาด้วยชื่อตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์
                      </Text>
                    </View>
                  ) : null
                }
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
