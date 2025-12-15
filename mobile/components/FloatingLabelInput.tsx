import React from 'react';
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
  TextInput as NativeTextInput,
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface FloatingLabelInputProps extends Omit<
  React.ComponentProps<typeof TextInput>,
  'error' | 'label'
> {
  label: string | React.ReactNode;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
  isRequired?: boolean;
  accentColor?: string;
  forceFocus?: boolean;
  testID?: string;
  labelBackgroundColor?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  isRequired = false,
  accentColor,
  forceFocus = false,
  value,
  style,
  multiline,
  labelBackgroundColor = '#FFFFFF',
  ...props
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocusedInternal, setIsFocusedInternal] = React.useState(false);

  // Animation for floating label
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  const isFocused = forceFocus || isFocusedInternal;
  const focusColor = accentColor || theme.colors.primary;
  const inputHeight = multiline ? 120 : 56;

  // Animate label when focus/blur or value changes
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedValue]);

  // Label animation styles
  const labelStyle: Animated.AnimatedProps<StyleProp<TextStyle>> = {
    position: 'absolute',
    left: 12,
    // ️ เมื่อลอย: top = -10, เมื่อในช่อง: top = 16
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    }),
    // ️ เมื่อลอย: fontSize = 12, เมื่อในช่อง: fontSize = 16
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    backgroundColor: labelBackgroundColor,
    paddingHorizontal: 4,
    // ️ สำคัญ: lineHeight สูงมากเพื่อรองรับ น้ำ (สระอำ + ไม้โท)
    lineHeight: 24,
    zIndex: 10,
  };

  const labelColor = isFocused ? focusColor : value ? '#a3a6af' : theme.colors.onSurfaceVariant;

  const displayLabel = typeof label === 'string' ? label : '';

  const inputRef = React.useRef<NativeTextInput>(null);

  return (
    <View style={[{ marginBottom: 16, marginTop: 4 }, containerStyle]}>
      {/* Custom External Label - ควบคุมได้ 100% */}
      <Animated.Text
        style={[
          labelStyle,
          {
            fontFamily: 'Kanit',
            color: labelColor,
          },
        ]}
        numberOfLines={1}
        onPress={() => inputRef.current?.focus()}
        suppressHighlighting={true}
      >
        {displayLabel}
        {isRequired && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Animated.Text>

      <TextInput
        ref={inputRef}
        testID={props.testID || 'floating-label-input'}
        mode="outlined"
        // ️ ซ่อน Label ของ React Native Paper
        label=""
        value={value}
        error={!!error}
        secureTextEntry={isPassword && !showPassword}
        onFocus={(e) => {
          setIsFocusedInternal(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocusedInternal(false);
          props.onBlur?.(e);
        }}
        activeOutlineColor={error ? theme.colors.error : focusColor}
        outlineColor={error ? theme.colors.error : isFocused ? focusColor : '#E5E7EB'}
        cursorColor={error ? theme.colors.error : focusColor}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        outlineStyle={{
          borderRadius: 12,
        }}
        style={[
          {
            backgroundColor: '#FFFFFF',
            fontSize: 16,
            lineHeight: 24,
            paddingVertical: 0,
            height: multiline ? undefined : inputHeight,
            minHeight: inputHeight,
            includeFontPadding: false,
          },
          style,
        ]}
        contentStyle={
          [
            multiline
              ? {
                  paddingTop: 16,
                  paddingBottom: 16,
                  textAlignVertical: 'top',
                }
              : {
                  textAlignVertical: 'center',
                },
          ] as StyleProp<TextStyle>
        }
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        right={
          isPassword ? (
            <TextInput.Icon
              testID="password-toggle-icon"
              icon={showPassword ? 'eye-off' : 'eye'}
              color={theme.colors.onSurfaceVariant}
              onPress={() => setShowPassword(!showPassword)}
              forceTextInputFocus={false}
            />
          ) : null
        }
        {...props}
      />

      {error && (
        <Text className="font-kanit text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
