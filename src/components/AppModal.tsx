import React, { useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {children}
        </View>
      </View>
    </Modal>
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
      backgroundColor: 'rgba(0,0,0,0.12)',
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
