import React, { useMemo } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';

export default function ImageViewerModal({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible && !!uri} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color={colors.white} />
        </TouchableOpacity>
        {uri && <Image source={{ uri }} style={styles.image} resizeMode="contain" />}
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    image: {
      width: '100%',
      height: '85%',
    },
    closeButton: {
      position: 'absolute',
      top: spacing.xl,
      right: spacing.lg,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
  });
