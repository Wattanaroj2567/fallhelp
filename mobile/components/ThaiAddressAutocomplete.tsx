// components/ThaiAddressAutocomplete.tsx
import React, { useState, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface ThailandAddress {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
}

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
  placeholder = 'ค้นหาที่อยู่โดยพิมพ์ตำบล, อำเภอ, จังหวัด หรือรหัสไปรษณีย์',
  isRequired = false,
  error,
}: ThaiAddressAutocompleteProps) {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Lazy Loading State
  const [data, setData] = useState<ThailandAddress[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Lazy Load Data when Modal opens
  useEffect(() => {
    if (showModal && data.length === 0) {
      setIsLoadingData(true);
      // Use setTimeout to unblock the main thread immediately after modal open
      const timer = setTimeout(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const loadedData = require('@/assets/thailand-address.json') as ThailandAddress[];
          setData(loadedData);
        } catch (e) {
          console.error("Failed to load address data", e);
        } finally {
          setIsLoadingData(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, data.length]);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter addresses based on debounced search query
  const filteredAddresses = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || data.length === 0) {
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
  }, [debouncedQuery, data]);

  const handleOpen = () => {
    setSearchQuery('');
    setDebouncedQuery('');
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
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const formatDisplayValue = () => {
    if (!value || !value.district) return placeholder;
    return `${value.district} » ${value.amphoe} » ${value.province} » ${value.zipcode}`;
  };

  // Border Color Logic
  const borderColorClass = error ? 'border-red-500' : 'border-gray-200';
  const labelColorClass = error ? 'text-red-500' : 'text-gray-400';

  return (
    <View className="mb-4 mt-1">
      <TouchableOpacity
        onPress={handleOpen}
        className={`bg-white rounded-2xl px-4 justify-center border h-14 ${borderColorClass}`}
      >
        {/* Floating Label (Simulated) */}
        <View className="absolute -top-2.5 left-3 bg-white px-1 z-10">
          <Text className={`font-kanit text-xs ${labelColorClass}`}>
            ค้นหาที่อยู่ {isRequired && <Text className="text-red-500">*</Text>}
          </Text>
        </View>

        {/* Input Text / Placeholder */}
        <View className="flex-row items-center justify-between">
          <Text
            className={`flex-1 font-kanit text-[16px] mr-2 ${
              value?.district ? 'text-gray-900' : 'text-gray-400'
            }`}
            numberOfLines={1}
          >
            {formatDisplayValue()}
          </Text>
          <MaterialIcons name="search" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text className="font-kanit text-xs text-red-500 mt-1 ml-1">{error}</Text>}

      {/* Search Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={handleClose}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable className="flex-1 bg-black/50 justify-end" onPress={handleClose}>
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
                <MaterialIcons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 font-kanit text-base ml-2 text-gray-700 h-full p-0"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Loading Indicator */}
              {isLoadingData && (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text className="font-kanit text-sm text-gray-400 mt-2">กำลังโหลดข้อมูล...</Text>
                </View>
              )}

              {/* Search Hint */}
              {!isLoadingData && searchQuery.length < 2 && (
                <View className="flex-row items-center px-4 py-2 gap-1.5">
                  <MaterialIcons name="info-outline" size={16} color="#9CA3AF" />
                  <Text className="font-kanit text-sm text-gray-400">
                    พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                  </Text>
                </View>
              )}

              {/* Results List */}
              {!isLoadingData && (
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
                          <Text className="font-semibold text-gray-700">{item.district}</Text>
                          {' » '}
                          <Text className="text-gray-500">{item.amphoe}</Text>
                          {' » '}
                          <Text className="text-gray-500">{item.province}</Text>
                          {' » '}
                          <Text className="font-medium text-[#16AD78]">{item.zipcode}</Text>
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    debouncedQuery.length >= 2 ? (
                      <View className="py-12 items-center">
                        <MaterialIcons name="search-off" size={48} color="#E5E7EB" />
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
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}