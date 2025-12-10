// components/AutocompleteInput.tsx
import React, { useState, useEffect } from "react";
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

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: string[];
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
  editable?: boolean;
}

export function AutocompleteInput({
  label,
  value,
  onChangeText,
  options,
  placeholder,
  isRequired = false,
  error,
  editable = true,
}: AutocompleteInputProps) {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options]);

  const handleOpen = () => {
    if (!editable) return;
    setSearchQuery("");
    // Show all options initially
    setFilteredOptions(options);
    setShowModal(true);
  };

  const handleSelect = (option: string) => {
    onChangeText(option);
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const labelColor = error ? theme.colors.error : value ? "#a3a6af" : "#a3a6af";

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, { color: labelColor }]}>
        {label} {isRequired && <Text style={{ color: "#EF4444" }}>*</Text>}
      </Text>

      {/* Input Field (Read-only, opens modal on press) */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={!editable}
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : value
              ? theme.colors.primary
              : "#E5E7EB",
            opacity: editable ? 1 : 0.5,
          },
        ]}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: value ? theme.colors.onSurface : "#a3a6af",
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={editable ? "#a3a6af" : "#E5E7EB"}
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal Picker */}
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
                <Text style={styles.modalTitle}>{label}</Text>
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
                  placeholder={`ค้นหา${label}...`}
                  placeholderTextColor="#a3a6af"
                  autoFocus={false}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <MaterialIcons name="close" size={20} color="#a3a6af" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.optionsList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      value === item && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        value === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {value === item && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>ไม่พบข้อมูล</Text>
                  </View>
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
    maxHeight: "80%",
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
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionItemSelected: {
    backgroundColor: "#F0FDF4",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "Kanit",
  },
  optionTextSelected: {
    color: "#16AD78",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#a3a6af",
    fontFamily: "Kanit",
  },
});
