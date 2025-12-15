import React from 'react';
import { ScrollView, ViewStyle, View, Keyboard, Pressable } from 'react-native';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrollViewRef?: React.Ref<any>; // Keep as any - KeyboardAwareScrollView has different ref type than ScrollView
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
  const baseClassName = className || 'flex-1 bg-white';
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container className={baseClassName} edges={useSafeArea ? edges : undefined} style={style}>
      {useScrollView ? (
        <>
          {header}
          {/* ✅ Use "Ready-made" standard library for form handling */}
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={[
              { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
              contentContainerStyle,
            ]}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            enableResetScrollToCoords={true} // Smart Reset enabled
            extraHeight={120}
            extraScrollHeight={120}
            viewIsInsideTabBar={false}
            keyboardShouldPersistTaps="handled"
            {...scrollViewProps} // Pass through other props like bounces/scrollEnabled
          >
            {children}
          </KeyboardAwareScrollView>
        </>
      ) : keyboardAvoiding ? (
        // Fixed view with keyboard dismiss - Using Pressable for better reliability
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          {header}
          <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
        </Pressable>
      ) : (
        // Fixed view without dismiss (for Lists)
        <>
          {header}
          <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
        </>
      )}
    </Container>
  );
};
