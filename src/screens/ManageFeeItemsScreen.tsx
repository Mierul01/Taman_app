import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';
import { FeeItem } from '../data/mockData';
import AppText from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageFeeItems'>;

const PERIOD_OPTIONS = ['Bulanan', 'Tahunan'];

function emptyItem(): FeeItem {
  return { id: `f_${Date.now()}`, title: '', description: '', amount: 0, period: 'Bulanan' };
}

export default function ManageFeeItemsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getFeeItems, setFeeItems } = usePayments();
  const [items, setItems] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<FeeItem | null>(null);
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getFeeItems(user.parkName).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [user?.parkName]);

  const openNew = () => {
    const item = emptyItem();
    setEditing(item);
    setAmountText('');
    setError('');
  };

  const openEdit = (item: FeeItem) => {
    setEditing({ ...item });
    setAmountText(item.amount ? String(item.amount) : '');
    setError('');
  };

  const closeEditor = () => {
    setEditing(null);
    setAmountText('');
    setError('');
  };

  const handleSaveItem = () => {
    if (!editing) return;
    const amount = Number(amountText);
    if (!editing.title.trim() || !amount || amount <= 0) {
      setError(t('manageFees.itemError'));
      return;
    }
    const finalItem: FeeItem = { ...editing, title: editing.title.trim(), description: editing.description.trim(), amount };
    setItems((prev) => {
      const exists = prev.some((i) => i.id === finalItem.id);
      return exists ? prev.map((i) => (i.id === finalItem.id ? finalItem : i)) : [...prev, finalItem];
    });
    closeEditor();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    await setFeeItems(user.parkName, items);
    setSaving(false);
    navigation.goBack();
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('manageFees.title')} subtitle={t('manageFees.subtitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={26} color={colors.textMuted} />
            <AppText style={styles.emptyText}>{t('manageFees.empty')}</AppText>
          </View>
        )}

        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </AppText>
              <AppText style={styles.itemDesc} numberOfLines={2}>
                {item.description}
              </AppText>
              <View style={styles.itemMetaRow}>
                <AppText style={styles.itemAmount}>RM {item.amount.toFixed(2)}</AppText>
                <View style={styles.periodPill}>
                  <AppText style={styles.periodPillText}>{item.period}</AppText>
                </View>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => openEdit(item)} hitSlop={6}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id)} hitSlop={6}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addRow} activeOpacity={0.8} onPress={openNew}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <AppText style={styles.addRowText}>{t('manageFees.addItem')}</AppText>
        </TouchableOpacity>

        <Button label={t('common.save')} onPress={handleSaveAll} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>

      <AppModal visible={!!editing} onClose={closeEditor}>
        <AppText style={styles.modalTitle}>
          {editing && items.some((i) => i.id === editing.id) ? t('manageFees.editItem') : t('manageFees.newItem')}
        </AppText>

        <AppText style={styles.fieldLabel}>{t('manageFees.itemName')}</AppText>
        <TextInput
          value={editing?.title ?? ''}
          onChangeText={(v) => setEditing((prev) => (prev ? { ...prev, title: v } : prev))}
          placeholder={t('manageFees.itemNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>{t('manageFees.itemDescription')}</AppText>
        <TextInput
          value={editing?.description ?? ''}
          onChangeText={(v) => setEditing((prev) => (prev ? { ...prev, description: v } : prev))}
          placeholder={t('manageFees.itemDescriptionPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <AppText style={styles.fieldLabel}>{t('manageFees.itemAmount')}</AppText>
        <View style={styles.amountWrap}>
          <AppText style={styles.currencyPrefix}>RM</AppText>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={styles.amountInput}
          />
        </View>

        <AppText style={styles.fieldLabel}>{t('manageFees.itemPeriod')}</AppText>
        <View style={styles.chipRow}>
          {PERIOD_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, editing?.period === p && styles.chipActive]}
              onPress={() => setEditing((prev) => (prev ? { ...prev, period: p } : prev))}
            >
              <AppText style={[styles.chipText, editing?.period === p && styles.chipTextActive]}>{p}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <View style={styles.modalActions}>
          <Button label={t('common.cancel')} variant="ghost" onPress={closeEditor} style={{ flex: 1 }} />
          <Button label={t('common.save')} onPress={handleSaveItem} style={{ flex: 1 }} />
        </View>
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadow.card,
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    itemDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    itemMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    periodPill: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    periodPillText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    itemActions: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginLeft: spacing.sm,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: radius.md,
    },
    addRowText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 46,
      fontSize: 14,
      color: colors.text,
    },
    textArea: {
      height: 80,
      paddingTop: spacing.sm,
      textAlignVertical: 'top',
    },
    amountWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
      backgroundColor: colors.background,
    },
    currencyPrefix: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    amountInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipTextActive: {
      color: colors.white,
    },
    error: {
      color: colors.danger,
      fontSize: 12,
      marginTop: spacing.sm,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
  });
