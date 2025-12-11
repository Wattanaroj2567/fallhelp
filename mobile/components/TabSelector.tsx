import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, StyleSheet } from "react-native";

interface TabSelectorProps {
    tabs: string[];
    activeTab: number;
    onTabChange: (index: number) => void;
    style?: ViewStyle;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
    tabs,
    activeTab,
    onTabChange,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            {tabs.map((tab, index) => {
                const isActive = activeTab === index;
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onTabChange(index)}
                        style={[
                            styles.tab,
                            isActive && styles.activeTab,
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                isActive && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6", // gray-100
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "transparent",
    },
    activeTab: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Kanit",
        color: "#6B7280", // gray-500
    },
    activeTabText: {
        color: "#111827", // gray-900
        fontWeight: "bold",
    },
});