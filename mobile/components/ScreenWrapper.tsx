import React from 'react';
import {
    ScrollView,
    ViewStyle,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface ScreenWrapperProps {
    children: React.ReactNode;
    useScrollView?: boolean;
    keyboardAvoiding?: boolean;
    contentContainerStyle?: ViewStyle;
    edges?: Edge[];
    style?: ViewStyle;
    scrollViewProps?: React.ComponentProps<typeof ScrollView>; // Keep for compatibility
    header?: React.ReactNode;
    scrollViewRef?: React.Ref<any>; // Update type to accept library ref
    className?: string; // NativeWind override
    useSafeArea?: boolean; // Use SafeAreaView or regular View
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    useScrollView = true,
    keyboardAvoiding = true,
    contentContainerStyle,
    edges = ['top', 'left', 'right'],
    style,
    scrollViewProps,
    header,
    scrollViewRef,
    className,
    useSafeArea = true,
}) => {
    const baseClassName = className || "flex-1 bg-white";
    const Container = useSafeArea ? SafeAreaView : View;

    return (
        <Container className={baseClassName} edges={useSafeArea ? edges : undefined} style={style}>
            {header}
            {useScrollView ? (
                // ✅ Use "Ready-made" standard library for form handling
                <KeyboardAwareScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={[
                        { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
                        contentContainerStyle,
                    ]}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    enableResetScrollToCoords={false}
                    extraHeight={100} // Reduced from 120 to 50 to prevent huge jumps
                    extraScrollHeight={100} // Reduced from 120 to 50
                    viewIsInsideTabBar={false}
                    keyboardShouldPersistTaps="handled"
                    {...scrollViewProps} // Pass through other props like bounces/scrollEnabled
                >
                    {children}
                </KeyboardAwareScrollView>
            ) : (
                // Fixed view (Login/Found, etc)
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={[{ flex: 1 }, contentContainerStyle]}>
                        {children}
                    </View>
                </TouchableWithoutFeedback>
            )}
        </Container>
    );
};
