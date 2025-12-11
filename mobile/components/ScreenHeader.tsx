import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bounceable } from "./Bounceable";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  backgroundColor?: string;
  noSafeArea?: boolean;
  style?: any;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightElement,
  transparent = false,
  backgroundColor,
  noSafeArea = false,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`${(transparent && !noSafeArea) ? "bg-black/30" : ""
        } ${!noSafeArea ? "rounded-b-[32px] pb-2" : ""}`}
      style={[{
        paddingTop: (transparent && !noSafeArea) ? insets.top : 0,
        backgroundColor: (transparent && !noSafeArea) ? undefined : (backgroundColor || (!noSafeArea ? "white" : undefined))
      }, style]}
    >
      <View className="flex-row items-center justify-between px-4 py-4">
        {/* Left: Back Button or Placeholder */}
        {onBack ? (
          <Bounceable
            testID="back-button"
            onPress={onBack}
            className="p-2 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            scale={0.9}
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={transparent ? "white" : "#374151"}
            />
          </Bounceable>
        ) : (
          <View className="w-8 h-11" />
        )}

        {/* Center: Title */}
        <Text
          className={`font-kanit text-xl ${transparent ? "text-white" : "text-gray-900"
            } text-center flex-1`}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right: Custom Element or Placeholder */}
        {rightElement ? (
          <View className="flex-row items-center">{rightElement}</View>
        ) : (
          <View className="w-8 h-11" />
        )}
      </View>
    </View>
  );
};
