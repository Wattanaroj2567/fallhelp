import React, { useState } from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";

export const UserInput = ({ style, ...props }: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            style={[
                styles.input,
                isFocused && styles.focused,
                style,
            ]}
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB", // gray-200
        borderRadius: 12, // rounded-xl
        paddingHorizontal: 16, // px-4
        paddingVertical: 12, // py-3
        fontFamily: "Kanit",
        fontSize: 16,
        color: "#111827", // gray-900
    },
    focused: {
        borderColor: "#16AD78", // Focus Color
        backgroundColor: "#F0FDF4", // Light green bg
    },
});
