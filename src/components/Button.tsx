import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { radius, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const colors = useThemeColors();
  const { styles, variantStyles, labelVariantStyles } = useMemo(() => makeStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.label, labelVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  const styles = StyleSheet.create({
    base: {
      paddingVertical: 14,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    danger: { backgroundColor: colors.danger },
    ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  };

  const labelVariantStyles: Record<string, { color: string }> = {
    primary: { color: colors.white },
    secondary: { color: colors.primaryDark },
    danger: { color: colors.white },
    ghost: { color: colors.primary },
  };

  return { styles, variantStyles, labelVariantStyles };
}
