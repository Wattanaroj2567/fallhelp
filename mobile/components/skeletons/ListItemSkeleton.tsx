import React from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface ListItemSkeletonProps {
    count?: number;
}

/**
 * Skeleton loader for list items
 * Shows animated placeholder while data is loading
 */
export const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({ count = 3 }) => {
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

    const SkeletonItem = () => (
        <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center">
            {/* Avatar Circle */}
            <Animated.View
                style={animatedStyle}
                className="w-12 h-12 rounded-full bg-gray-200"
            />

            <View className="flex-1 ml-4">
                {/* Name Line */}
                <Animated.View
                    style={[animatedStyle, { width: '70%' }]}
                    className="h-4 bg-gray-200 rounded-md mb-2"
                />
                {/* Info Line */}
                <Animated.View
                    style={[animatedStyle, { width: '50%' }]}
                    className="h-3 bg-gray-200 rounded-md"
                />
            </View>

            {/* Icon Placeholder */}
            <Animated.View
                style={animatedStyle}
                className="w-8 h-8 rounded-full bg-gray-200"
            />
        </View>
    );

    return (
        <View className="px-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};
