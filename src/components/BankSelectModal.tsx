import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PAYMENT_METHOD_OPTIONS, PaymentMethodGroup } from '../data/paymentMethods';
import AppText from './AppText';

export default function BankSelectModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (label: string, group: PaymentMethodGroup) => void;
}) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const filtered = useMemo(
    () => PAYMENT_METHOD_OPTIONS.filter((o) => o.label.toLowerCase().includes(trimmed.toLowerCase())),
    [trimmed]
  );
  const banks = filtered.filter((o) => o.group === 'bank');
  const ewallets = filtered.filter((o) => o.group === 'ewallet');
  const exactMatch = PAYMENT_METHOD_OPTIONS.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (label: string, group: PaymentMethodGroup) => {
    setQuery('');
    onSelect(label, group);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText style={styles.title}>{t('bankAccount.selectMethod')}</AppText>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('bankAccount.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.lg }}>
            {trimmed.length > 0 && !exactMatch && (
              <TouchableOpacity style={styles.customRow} onPress={() => handleSelect(trimmed, 'other')}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <AppText style={styles.customRowText}>{t('bankAccount.useCustom', { name: trimmed })}</AppText>
              </TouchableOpacity>
            )}

            {banks.length > 0 && (
              <>
                <AppText style={styles.sectionLabel}>{t('bankAccount.groupBank')}</AppText>
                {banks.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.row}
                    onPress={() => handleSelect(option.label, option.group)}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: withAlpha(colors.primary, 0.1) }]}>
                      <Ionicons name="business-outline" size={16} color={colors.primary} />
                    </View>
                    <AppText style={styles.rowText}>{option.label}</AppText>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {ewallets.length > 0 && (
              <>
                <AppText style={styles.sectionLabel}>{t('bankAccount.groupEwallet')}</AppText>
                {ewallets.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.row}
                    onPress={() => handleSelect(option.label, option.group)}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: withAlpha(colors.accent, 0.14) }]}>
                      <Ionicons name="phone-portrait-outline" size={16} color={colors.accent} />
                    </View>
                    <AppText style={styles.rowText}>{option.label}</AppText>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {banks.length === 0 && ewallets.length === 0 && trimmed.length > 0 && (
              <AppText style={styles.emptyText}>{t('bankAccount.noResults')}</AppText>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.15)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      maxHeight: '80%',
      paddingTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 44,
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      height: '100%',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    rowIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {
      fontSize: 14,
      color: colors.text,
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.xs,
    },
    customRowText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      flex: 1,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
