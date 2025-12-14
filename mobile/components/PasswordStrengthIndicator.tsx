import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (password.length === 0) return null;

  // Calculate strength (0-4)
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;

  // Get strength config
  const strengthConfig = {
    0: { label: 'กรอกรหัสผ่าน', color: '#E5E7EB', textColor: '#9CA3AF' },
    1: { label: 'อ่อนมาก', color: '#EF4444', textColor: '#EF4444' },
    2: { label: 'อ่อน', color: '#F97316', textColor: '#F97316' },
    3: { label: 'ปานกลาง', color: '#EAB308', textColor: '#EAB308' },
    4: { label: 'แข็งแรง', color: '#16AD78', textColor: '#16AD78' },
  }[strength] || { label: '', color: '#E5E7EB', textColor: '#9CA3AF' };

  return (
    <View className="mb-4">
      {/* Strength Label */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="font-kanit"
          style={{ fontSize: 12, color: '#6B7280' }}
        >
          ความแข็งแรงของรหัสผ่าน
        </Text>
        <Text
          className="font-kanit font-semibold"
          style={{ fontSize: 12, color: strengthConfig.textColor }}
        >
          {strengthConfig.label}
        </Text>
      </View>

      {/* Strength Bar */}
      <View
        style={{
          height: 6,
          backgroundColor: '#E5E7EB',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${(strength / 4) * 100}%`,
            backgroundColor: strengthConfig.color,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Requirements Dots */}
      <View className="flex-row justify-between mt-3">
        <RequirementDot label="8+ ตัว" met={password.length >= 8} />
        <RequirementDot label="A-Z" met={/[A-Z]/.test(password)} />
        <RequirementDot label="a-z" met={/[a-z]/.test(password)} />
        <RequirementDot label="0-9" met={/[0-9]/.test(password)} />
      </View>
    </View>
  );
};

const RequirementDot: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <View className="flex-row items-center">
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: met ? '#16AD78' : '#D1D5DB',
        marginRight: 6,
      }}
    />
    <Text
      className="font-kanit"
      style={{
        fontSize: 13,
        color: met ? '#16AD78' : '#9CA3AF',
      }}
    >
      {label}
    </Text>
  </View>
);
