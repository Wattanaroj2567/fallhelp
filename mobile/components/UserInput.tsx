import React, { useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';

export const UserInput = ({
  style,
  className,
  ...props
}: TextInputProps & { className?: string }) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClass = 'bg-white border rounded-xl px-4 py-3 font-kanit text-base text-gray-900';
  const focusClass = isFocused ? 'border-[#16AD78] bg-green-50' : 'border-gray-200';

  return (
    <TextInput
      className={`${baseClass} ${focusClass} ${className || ''}`}
      style={style} // Allow override for dynamic values only
      placeholderTextColor="#9CA3AF"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};
