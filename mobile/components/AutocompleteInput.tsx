import React, { useState, useEffect } from "react";
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

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: string[];
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
  editable?: boolean;
  containerClassName?: string;
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
  containerClassName,
}: AutocompleteInputProps) {
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

  // Dynamic Styles Logic
  const labelColorClass = error ? "text-red-500" : "text-gray-400";
  
  const getBorderColorClass = () => {
    if (error) return "border-red-500";
    if (value) return "border-primary"; // ใช้สี Primary ของ App (สีเขียว/ฟ้าตาม Theme)
    return "border-gray-200";
  };

  return (
    <View className={`mb-4 ${containerClassName || ''}`}>
      {/* Label */}
      <Text className={`text-xs mb-1.5 font-kanit ${labelColorClass}`}>
        {label} {isRequired && <Text className="text-red-500">*</Text>}
      </Text>

      {/* Input Field (Read-only trigger) */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={!editable}
        className={`flex-row items-center justify-between border rounded-xl px-4 py-3.5 bg-white ${getBorderColorClass()} ${
          editable ? 'opacity-100' : 'opacity-50'
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`flex-1 text-base font-kanit ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={editable ? "#9CA3AF" : "#E5E7EB"}
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text className="text-xs text-red-500 mt-1 font-kanit">
          {error}
        </Text>
      )}

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
          <Pressable 
            className="flex-1 bg-black/50 justify-end" 
            onPress={handleClose}
          >
            <Pressable
              className="bg-white rounded-t-3xl max-h-[80%] pb-5"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <Text className="text-lg font-kanit-bold text-gray-700">
                  {label}
                </Text>
                <TouchableOpacity onPress={handleClose} className="p-1">
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View className="flex-row items-center m-4 px-3 py-2 bg-gray-100 rounded-xl">
                <MaterialIcons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 text-base ml-2 font-kanit text-gray-700 p-0"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={`ค้นหา${label}...`}
                  placeholderTextColor="#9CA3AF"
                  autoFocus={false}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <MaterialIcons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) => `${item}-${index}`}
                className="max-h-[400px]"
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = value === item;
                  return (
                    <TouchableOpacity
                      className={`flex-row justify-between items-center px-4 py-3.5 border-b border-gray-50 ${
                        isSelected ? "bg-green-50" : "bg-white"
                      }`}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        className={`text-base font-kanit ${
                          isSelected 
                            ? "text-[#16AD78] font-kanit-bold" 
                            : "text-gray-700"
                        }`}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color="#16AD78"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View className="p-8 items-center">
                    <Text className="text-base text-gray-400 font-kanit">
                      ไม่พบข้อมูล
                    </Text>
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