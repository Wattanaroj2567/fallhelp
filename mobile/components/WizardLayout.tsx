// components/WizardLayout.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenWrapper } from "./ScreenWrapper";
import { ScreenHeader } from "./ScreenHeader";

// Step labels (fixed for FallHelp Setup)
const STEP_LABELS = [
    "กรอกข้อมูล\nผู้สูงอายุ",
    "ติดตั้งอุปกรณ์",
    "ตั้งค่า WiFi",
];

interface WizardLayoutProps {
    currentStep: 1 | 2 | 3;
    title: string;
    onBack: () => void;
    children: React.ReactNode;
    transparent?: boolean; // For Camera mode in Step 2
    contentContainerStyle?: object;
    scrollViewProps?: object;
    scrollViewRef?: React.Ref<any>;
    headerExtra?: React.ReactNode;
}

interface StepIndicatorProps {
    stepNumber: number;
    currentStep: number;
    label: string;
    transparent?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    stepNumber,
    currentStep,
    label,
    transparent = false,
}) => {
    const isCompleted = stepNumber < currentStep;
    const isActive = stepNumber === currentStep;

    // Circle styles
    let circleClass = "";
    let textClass = "";
    let labelClass = "";

    if (isCompleted) {
        circleClass = "bg-[#16AD78] border-[#16AD78]";
        textClass = "text-white";
        labelClass = transparent ? "text-green-400" : "text-green-600";
    } else if (isActive) {
        circleClass = transparent
            ? "bg-blue-500 border-blue-400"
            : "bg-blue-600 border-blue-600";
        textClass = "text-white";
        labelClass = transparent ? "text-blue-300" : "text-blue-600";
    } else {
        circleClass = transparent
            ? "bg-black/40 border-white/30"
            : "bg-white border-gray-200";
        textClass = "text-gray-400";
        labelClass = "text-gray-400";
    }

    return (
        <View className="flex-1 items-center">
            <View
                className={`w-8 h-8 rounded-full items-center justify-center z-10 mb-2 shadow-sm border ${circleClass}`}
            >
                {isCompleted ? (
                    <Ionicons name="checkmark" size={20} color="white" />
                ) : (
                    <Text className={`font-kanit text-sm font-semibold ${textClass}`}>
                        {stepNumber}
                    </Text>
                )}
            </View>
            <Text className={`text-xs text-center font-kanit ${labelClass}`}>
                {label}
            </Text>
        </View>
    );
};

interface ProgressBarProps {
    currentStep: number;
    transparent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, transparent = false }) => {
    const lineColorBase = transparent ? "bg-white/20" : "bg-gray-200";
    const lineColorActive = "bg-[#16AD78]";

    // Calculate progress line widths
    // Step 1: 0% active, Step 2: 50% active, Step 3: 100% active
    const firstSegmentActive = currentStep >= 2;
    const secondSegmentActive = currentStep >= 3;

    return (
        <View className="px-6 pb-2">
            <View className="relative">
                {/* Background Line */}
                <View
                    className={`absolute top-4 left-[16%] right-[16%] h-[2px] ${lineColorBase}`}
                    style={{ zIndex: 0 }}
                />
                {/* Active Line - First Segment (Step 1 to 2) */}
                {firstSegmentActive && (
                    <View
                        className={`absolute top-4 left-[16%] right-[50%] h-[2px] ${lineColorActive}`}
                        style={{ zIndex: 1 }}
                    />
                )}
                {/* Active Line - Second Segment (Step 2 to 3) */}
                {secondSegmentActive && (
                    <View
                        className={`absolute top-4 left-[50%] right-[16%] h-[2px] ${lineColorActive}`}
                        style={{ zIndex: 1 }}
                    />
                )}

                {/* Step Indicators */}
                <View className="flex-row justify-between">
                    {STEP_LABELS.map((label, index) => (
                        <StepIndicator
                            key={index}
                            stepNumber={index + 1}
                            currentStep={currentStep}
                            label={label}
                            transparent={transparent}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

export const WizardLayout: React.FC<WizardLayoutProps> = ({
    currentStep,
    title,
    onBack,
    children,
    transparent = false,
    contentContainerStyle,
    scrollViewProps,
    scrollViewRef,
    headerExtra,
}) => {
    const insets = useSafeAreaInsets();

    // Transparent mode (e.g., Camera view in Step 2)
    if (transparent) {
        return (
            <View className="flex-1">
                {/* Header with Progress Bar - Transparent Background */}
                <View
                    className="bg-black/30 rounded-b-[32px] overflow-hidden pb-4"
                    style={{ paddingTop: insets.top }}
                >
                    <ScreenHeader
                        title={title}
                        onBack={onBack}
                        transparent={true}
                    />
                    <ProgressBar currentStep={currentStep} transparent={true} />
                    {headerExtra}
                </View>

                {/* Content */}
                {children}
            </View>
        );
    }

    // Normal mode (white background)
    return (
        <ScreenWrapper
            useSafeArea={true}
            edges={["top", "left", "right"]}
            contentContainerStyle={contentContainerStyle}
            scrollViewProps={scrollViewProps}
            scrollViewRef={scrollViewRef}
            header={
                <View>
                    <ScreenHeader title={title} onBack={onBack} />
                    <ProgressBar currentStep={currentStep} />
                    {headerExtra && <View className="px-6 pb-2 mt-4">{headerExtra}</View>}
                </View>
            }
        >
            {children}
        </ScreenWrapper>
    );
};
