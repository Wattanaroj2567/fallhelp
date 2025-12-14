import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

interface ConnectionToastProps {
  state: ConnectionState;
  visible: boolean;
  onHide?: () => void;
}

/**
 * ConnectionToast - Shows socket connection status with animation
 * 
 * @example
 * <ConnectionToast 
 *   state="connected" 
 *   visible={showToast} 
 *   onHide={() => setShowToast(false)} 
 * />
 */
export function ConnectionToast({ state, visible, onHide }: ConnectionToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-hide after 3 seconds for "connected" state only
      if (state === 'connected' && onHide) {
        hideTimeout.current = setTimeout(() => {
          translateY.value = withTiming(-100, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onHide)();
          });
        }, 3000);
      }
    } else {
      // Slide out
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [visible, state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const config = getConfig(state);

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { backgroundColor: config.bgColor }]}>
        <MaterialIcons 
          name={config.icon as any} 
          size={20} 
          color={config.iconColor} 
          style={styles.icon}
        />
        <Text style={[styles.text, { color: config.textColor }]}>
          {config.text}
        </Text>
      </View>
    </Animated.View>
  );
}

function getConfig(state: ConnectionState) {
  switch (state) {
    case 'connected':
      return {
        bgColor: '#ECFDF5',
        icon: 'wifi',
        iconColor: '#16AD78',
        textColor: '#065F46',
        text: 'เชื่อมต่อสำเร็จ',
      };
    case 'disconnected':
      return {
        bgColor: '#FEF3C7',
        icon: 'wifi-off',
        iconColor: '#D97706',
        textColor: '#92400E',
        text: 'ขาดการเชื่อมต่อ',
      };
    case 'reconnecting':
      return {
        bgColor: '#FEF3C7',
        icon: 'sync',
        iconColor: '#D97706',
        textColor: '#92400E',
        text: 'กำลังเชื่อมต่อ...',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Kanit',
    fontWeight: '500',
  },
});
