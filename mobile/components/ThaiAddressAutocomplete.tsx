// components/ThaiAddressAutocomplete.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
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
  }, [searchQuery]);

  const handleOpen = () => {
    setSearchQuery("");
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
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
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

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, { color: labelColor }]}>
        ค้นหาที่อยู่ {isRequired && <Text style={{ color: "#EF4444" }}>*</Text>}
      </Text>

      {/* Input Field (opens modal) */}
      <TouchableOpacity
        onPress={handleOpen}
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : value?.district
              ? theme.colors.primary
              : "#E5E7EB",
          },
        ]}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: value?.district ? theme.colors.onSurface : "#a3a6af",
            },
          ]}
          numberOfLines={1}
        >
          {formatDisplayValue()}
        </Text>
        <MaterialIcons name="search" size={24} color="#a3a6af" />
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Search Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>ค้นหาที่อยู่ของคุณ</Text>
                <TouchableOpacity onPress={handleClose}>
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#a3a6af" />
                <TextInput
                  style={styles.searchInput}
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
                <View style={styles.hintContainer}>
                  <MaterialIcons
                    name="info-outline"
                    size={16}
                    color="#a3a6af"
                  />
                  <Text style={styles.hintText}>
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
                style={styles.resultsList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultText}>
                        <Text style={styles.resultHighlight}>
                          {item.district}
                        </Text>
                        {" » "}
                        <Text style={styles.resultSecondary}>
                          {item.amphoe}
                        </Text>
                        {" » "}
                        <Text style={styles.resultSecondary}>
                          {item.province}
                        </Text>
                        {" » "}
                        <Text style={styles.resultZipcode}>{item.zipcode}</Text>
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
                  searchQuery.length >= 2 ? (
                    <View style={styles.emptyContainer}>
                      <MaterialIcons
                        name="search-off"
                        size={48}
                        color="#E5E7EB"
                      />
                      <Text style={styles.emptyText}>ไม่พบที่อยู่ที่ค้นหา</Text>
                      <Text style={styles.emptyHint}>
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Kanit",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Kanit",
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontFamily: "Kanit",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Kanit",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Kanit",
    color: "#374151",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  hintText: {
    fontSize: 14,
    color: "#a3a6af",
    fontFamily: "Kanit",
  },
  resultsList: {
    maxHeight: 500,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultContent: {
    flex: 1,
  },
  resultText: {
    fontSize: 15,
    fontFamily: "Kanit",
    lineHeight: 22,
  },
  resultHighlight: {
    color: "#374151",
    fontWeight: "600",
  },
  resultSecondary: {
    color: "#6B7280",
  },
  resultZipcode: {
    color: "#16AD78",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Kanit",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: "#a3a6af",
    fontFamily: "Kanit",
    textAlign: "center",
  },
});
