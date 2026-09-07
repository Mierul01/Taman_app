import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppText from './AppText';

export type SelectOption = string | { label: string; disabled?: boolean; isHeader?: boolean };

type NormalizedOption = { label: string; disabled: boolean; isHeader: boolean; key: string };

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  style?: ViewStyle;
};

function normalize(options: SelectOption[]): NormalizedOption[] {
  return options.map((opt, index) => {
    if (typeof opt === 'string') {
      return { label: opt, disabled: false, isHeader: false, key: `${index}-${opt}` };
    }
    return {
      label: opt.label,
      disabled: !!opt.disabled,
      isHeader: !!opt.isHeader,
      key: `${index}-${opt.label}`,
    };
  });
}

export default function SelectField({ label, icon, value, options, placeholder, disabled, style, onSelect }: Props & { onSelect: (value: string) => void }) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const normalized = useMemo(() => normalize(options), [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    const result: NormalizedOption[] = [];
    let pendingHeader: NormalizedOption | null = null;
    for (const item of normalized) {
      if (item.isHeader) {
        pendingHeader = item;
        continue;
      }
      if (item.label.toLowerCase().includes(q)) {
        if (pendingHeader) {
          result.push(pendingHeader);
          pendingHeader = null;
        }
        result.push(item);
      }
    }
    return result;
  }, [normalized, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={style}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TouchableOpacity
        style={[styles.inputWrap, disabled && styles.inputWrapDisabled]}
        activeOpacity={disabled ? 1 : 0.75}
        onPress={() => !disabled && setOpen(true)}
      >
        <View style={styles.inputIconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <AppText style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <AppModal visible={open} onClose={close}>
        <AppText style={styles.modalTitle}>{label}</AppText>
        {normalized.length > 6 && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={15} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('common.search')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={styles.searchInput}
            />
            {query ? (
              <Ionicons name="close-circle" size={16} color={colors.textMuted} onPress={() => setQuery('')} />
            ) : null}
          </View>
        )}
        {filtered.length === 0 ? (
          <AppText style={styles.emptyText}>{t('common.noResults')}</AppText>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.key}
            style={styles.optionList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              item.isHeader ? (
                <AppText style={styles.sectionHeader}>{item.label}</AppText>
              ) : (
                <TouchableOpacity
                  style={[styles.option, item.disabled && styles.optionDisabled]}
                  activeOpacity={item.disabled ? 1 : 0.7}
                  disabled={item.disabled}
                  onPress={() => {
                    onSelect(item.label);
                    close();
                  }}
                >
                  <AppText
                    style={[
                      styles.optionText,
                      item.label === value && styles.optionTextSelected,
                      item.disabled && styles.optionTextDisabled,
                    ]}
                  >
                    {item.label}
                  </AppText>
                  {item.disabled ? (
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                  ) : item.label === value ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              )
            }
          />
        )}
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
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      height: 40,
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      height: '100%',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: spacing.lg,
    },
    optionList: {
      maxHeight: 340,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      backgroundColor: withAlpha(colors.primary, 0.06),
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionDisabled: {
      opacity: 0.5,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    optionTextDisabled: {
      color: colors.textMuted,
    },
  });
