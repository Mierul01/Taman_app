import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';

export default function AppModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {children}
      </View>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      zIndex: 1000,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    closeButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
  });
