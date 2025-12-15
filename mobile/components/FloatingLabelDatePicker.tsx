import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface FloatingLabelDatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  isRequired?: boolean;
  error?: string;
  disabled?: boolean;
  containerStyle?: object;
}

export function FloatingLabelDatePicker({
  label = 'วัน/เดือน/ปีเกิด',
  value,
  onChange,
  isRequired = false,
  error,
  disabled = false,
  containerStyle,
}: FloatingLabelDatePickerProps) {
  const theme = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: unknown, selectedDate?: Date) => {
    const currentDate = selectedDate || value || new Date();
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    onChange(currentDate);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return label;
    const day = date.getDate();
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const borderColor = error
    ? theme.colors.error
    : showDatePicker
      ? theme.colors.primary
      : '#E5E7EB';

  const labelColor = error ? theme.colors.error : showDatePicker ? theme.colors.primary : '#a3a6af';

  return (
    <View style={[{ marginBottom: 16, marginTop: 4 }, containerStyle]}>
      <TouchableOpacity
        onPress={() => !disabled && setShowDatePicker(true)}
        className="bg-white rounded-xl px-4 justify-center"
        style={{
          height: 56,
          borderWidth: 1,
          borderColor: borderColor,
          backgroundColor: disabled ? '#F3F4F6' : 'white',
        }}
        disabled={disabled}
      >
        {value ? (
          <View
            className={`absolute -top-2.5 left-3 px-1 z-10 ${
              disabled ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <Text className="font-kanit" style={{ fontSize: 12, color: labelColor }}>
              {label} {isRequired && <Text style={{ color: '#EF4444' }}>*</Text>}
            </Text>
          </View>
        ) : null}

        <Text
          className="font-kanit text-[16px]"
          style={{
            color: value ? theme.colors.onSurface : '#a3a6af',
          }}
        >
          {value ? (
            formatDate(value)
          ) : (
            <>
              {label} {isRequired && <Text style={{ color: '#EF4444' }}>*</Text>}
            </>
          )}
        </Text>

        <View className="absolute right-4 top-4">
          <MaterialIcons name="calendar-today" size={20} color={labelColor} />
        </View>
      </TouchableOpacity>

      {/* Error Text */}
      {error && (
        <Text
          style={{
            fontFamily: 'Kanit',
            color: theme.colors.error,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}

      {/* Modal for iOS */}
      {Platform.OS === 'ios' ? (
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
            <Pressable className="bg-white pb-6 rounded-t-3xl" onPress={(e) => e.stopPropagation()}>
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <Text className="font-kanit text-lg font-bold">เลือก{label}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="font-kanit text-blue-600 text-lg font-bold">เสร็จสิ้น</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value || new Date()}
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
            value={value || new Date()}
            maximumDate={new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </View>
  );
}
