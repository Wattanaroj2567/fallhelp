import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BounceableProps extends PressableProps {
    scale?: number; // Target scale when pressed (default 0.96)
    springConfig?: {
        mass?: number;
        stiffness?: number;
        damping?: number;
    };
    style?: StyleProp<ViewStyle>;
    debounceTime?: number;
}

export const Bounceable: React.FC<BounceableProps> = ({
    children,
    style,
    scale = 0.96,
    springConfig = { mass: 0.5, stiffness: 300, damping: 13 },
    debounceTime = 1000, // Default debounce time 1000ms
    disabled,
    onPress,
    ...props
}) => {
    const isPressed = useSharedValue(false);
    const lastPressTime = React.useRef(0);

    const handlePress = React.useCallback((event: any) => {
        if (!onPress || disabled) return;

        const now = Date.now();
        const timeSinceLastPress = now - lastPressTime.current;

        if (timeSinceLastPress > debounceTime) {
            lastPressTime.current = now;
            onPress(event);
        } else {
            console.log(`Blocked double click. Time since last: ${timeSinceLastPress}ms`);
        }
    }, [onPress, debounceTime, disabled]);

    const animatedStyle = useAnimatedStyle(() => {
        // Only animate scale if not disabled
        const targetScale = isPressed.value && !disabled ? scale : 1;

        return {
            transform: [
                {
                    scale: withSpring(targetScale, springConfig),
                },
            ],
            // Optional: slight opacity change for better feedback
            opacity: withSpring(isPressed.value && !disabled ? 0.9 : 1, {
                mass: 0.5, stiffness: 200, damping: 20
            }),
        };
    });

    return (
        <AnimatedPressable
            {...props}
            onPress={handlePress}
            disabled={disabled}
            onPressIn={(e) => {
                isPressed.value = true;
                props.onPressIn?.(e);
            }}
            onPressOut={(e) => {
                isPressed.value = false;
                props.onPressOut?.(e);
            }}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};
