import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Keyboard } from "react-native";
import { FloatingLabelInput } from "./FloatingLabelInput";
import { TextInput } from "react-native-paper";

interface GenderSelectProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    isRequired?: boolean; // ✅ Add isRequired prop
}

export function GenderSelect({
    value,
    onChange,
    label = "เพศ",
    error,
    isRequired = false, // Default to false
}: GenderSelectProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Mapping for display
    const getDisplayValue = (val: string) => {
        switch (val) {
            case "MALE":
                return "ชาย";
            case "FEMALE":
                return "หญิง";
            case "OTHER":
                return "อื่นๆ";
            default:
                return "";
        }
    };

    const options = [
        { label: "ชาย", value: "MALE" },
        { label: "หญิง", value: "FEMALE" },
        { label: "อื่นๆ", value: "OTHER" },
    ];

    return (
        <View style={{ position: "relative" }}>
            {/* Input Field Representation */}
            <View pointerEvents="none">
                <FloatingLabelInput
                    label={label}
                    value={getDisplayValue(value)}
                    editable={false}
                    isRequired={isRequired} // Pass prop down
                    error={error}
                    forceFocus={showPicker} // ✅ Force focus state when modal open
                    accentColor={showPicker ? "#16AD78" : undefined} // ✅ Green border when modal open
                    right={
                        <TextInput.Icon
                            icon="chevron-down"
                            color={showPicker ? "#16AD78" : "#6B7280"} // ✅ Green icon when open
                            forceTextInputFocus={false}
                        />
                    }
                />
            </View>

            {/* Invisible Overlay to Open Modal */}
            <Pressable
                onPress={() => {
                    Keyboard.dismiss(); // ✅ Blur other inputs first
                    setShowPicker(true);
                }}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                }}
            />

            {/* Modal Selection */}
            <Modal
                transparent={true}
                visible={showPicker}
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center px-6"
                    onPress={() => setShowPicker(false)}
                >
                    <View className="bg-white w-full rounded-2xl p-4">
                        <Text className="font-kanit text-lg font-bold mb-4 text-center">
                            เลือกเพศ
                        </Text>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className="py-4 border-b border-gray-100"
                                onPress={() => {
                                    onChange(option.value);
                                    setShowPicker(false);
                                }}
                            >
                                <Text
                                    className={`font-kanit text-center text-base ${value === option.value
                                        ? "text-[#16AD78] font-bold"
                                        : "text-gray-700"
                                        }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
