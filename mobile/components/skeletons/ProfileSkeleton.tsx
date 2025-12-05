import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';

/**
 * Skeleton loader for profile/header sections
 * Shows avatar + name/info placeholder
 */
export const ProfileSkeleton: React.FC = () => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className="items-center py-6">
            {/* Avatar */}
            <Animated.View
                style={animatedStyle}
                className="w-24 h-24 rounded-full bg-gray-200 mb-4"
            />

            {/* Name */}
            <Animated.View
                style={[animatedStyle, { width: 150 }]}
                className="h-5 bg-gray-200 rounded-md mb-2"
            />

            {/* Info Line */}
            <Animated.View
                style={[animatedStyle, { width: 120 }]}
                className="h-4 bg-gray-200 rounded-md mb-1"
            />

            {/* Secondary Info */}
            <Animated.View
                style={[animatedStyle, { width: 100 }]}
                className="h-3 bg-gray-200 rounded-md"
            />
        </View>
    );
};
