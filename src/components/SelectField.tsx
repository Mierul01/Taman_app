import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function SelectField({ label, icon, value, options, placeholder, disabled, style, onSelect }: Props & { onSelect: (value: string) => void }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrap, disabled && styles.inputWrapDisabled]}
        activeOpacity={disabled ? 1 : 0.75}
        onPress={() => !disabled && setOpen(true)}
      >
        <View style={styles.inputIconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <AppModal visible={open} onClose={() => setOpen(false)}>
        <Text style={styles.modalTitle}>{label}</Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          style={styles.optionList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.7}
              onPress={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>{item}</Text>
              {item === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.background,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.sm,
      height: 56,
      gap: spacing.sm,
    },
    inputWrapDisabled: {
      opacity: 0.5,
    },
    inputIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: withAlpha(colors.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    placeholder: {
      color: colors.textMuted,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    optionList: {
      maxHeight: 340,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
