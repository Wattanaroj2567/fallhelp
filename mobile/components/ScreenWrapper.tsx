import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ViewStyle,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    useScrollView?: boolean;
    keyboardAvoiding?: boolean;
    contentContainerStyle?: ViewStyle;
    edges?: Edge[];
    style?: ViewStyle;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    useScrollView = true,
    keyboardAvoiding = true,
    contentContainerStyle,
    edges = ['top', 'left', 'right'],
    style,
}) => {
    const Wrapper = keyboardAvoiding ? KeyboardAvoidingView : View;
    const wrapperProps = keyboardAvoiding
        ? {
            behavior: (Platform.OS === 'ios' ? 'padding' : 'height') as 'padding' | 'height',
            style: { flex: 1 },
            keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
        }
        : { style: { flex: 1 } };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={edges} style={style}>
            <Wrapper {...wrapperProps}>
                {useScrollView ? (
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={[
                            { paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 },
                            contentContainerStyle,
                        ]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={[{ flex: 1 }, contentContainerStyle]}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </Wrapper>
        </SafeAreaView>
    );
};
