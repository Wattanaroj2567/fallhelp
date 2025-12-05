import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';

interface CardSkeletonProps {
    height?: number;
}

/**
 * Skeleton loader for card-based layouts
 * Used for dashboard cards, stats, etc.
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ height = 120 }) => {
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
        <View className="bg-white rounded-2xl p-4" style={{ height }}>
            {/* Icon + Title */}
            <View className="flex-row items-center mb-4">
                <Animated.View
                    style={animatedStyle}
                    className="w-10 h-10 rounded-full bg-gray-200 mr-3"
                />
                <Animated.View
                    style={[animatedStyle, { width: '50%' }]}
                    className="h-4 bg-gray-200 rounded-md"
                />
            </View>

            {/* Content Lines */}
            <Animated.View
                style={[animatedStyle, { width: '90%' }]}
                className="h-6 bg-gray-200 rounded-md mb-2"
            />
            <Animated.View
                style={[animatedStyle, { width: '70%' }]}
                className="h-4 bg-gray-200 rounded-md"
            />
        </View>
    );
};
