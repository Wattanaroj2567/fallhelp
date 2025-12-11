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
                            isActive ? styles.tabActive : styles.tabInactive
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            isActive ? styles.tabTextActive : styles.tabTextInactive
                        ]}>
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
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabInactive: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontFamily: 'Kanit',
        fontSize: 14,
    },
    tabTextActive: {
        color: '#111827',
        fontFamily: 'Kanit',
        fontWeight: '700',
    },
    tabTextInactive: {
        color: '#6B7280',
        fontFamily: 'Kanit',
        fontWeight: '400',
    },
});
