import {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

// Constants for input animation
const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;

/**
 * Custom hook for animated floating label inputs
 * Used across the app for consistent input field animations
 * 
 * @param focused - Whether the input is currently focused
 * @param value - Current value of the input
 * @returns Object containing animated styles for container and text
 */
export const useInputAnimation = (focused: boolean, value: string) => {
  const progress = useDerivedValue(
    () => withTiming(focused || !!value ? 1 : 0, { duration: 200 }),
    [focused, value]
  );

  const containerStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
    backgroundColor: progress.value > 0.5 ? '#FFFFFF' : 'transparent',
    paddingHorizontal: 4,
    zIndex: 1,
  }));

  const textStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(progress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
    color: focused ? '#16AD78' : '#9CA3AF',
  }));

  return { containerStyle, textStyle };
};

// Export constants for use in components
export const INPUT_ANIMATION_CONSTANTS = {
  INPUT_HEIGHT,
  LABEL_FONT_LARGE,
  LABEL_FONT_SMALL,
  LABEL_TOP_START,
  LABEL_TOP_END,
};
