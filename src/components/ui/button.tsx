import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

interface ButtonProps {
  children: React.ReactNode;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textColor?: string;
  buttonColor?: string;
}

export function Button({
  children,
  mode = 'contained',
  onPress,
  disabled = false,
  loading = false,
  style,
  textColor,
  buttonColor,
  ...props
}: ButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={style}
      textColor={textColor}
      buttonColor={buttonColor}
      {...props}
    >
      {children}
    </PaperButton>
  );
} 