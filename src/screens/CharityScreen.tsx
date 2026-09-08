import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import PaymentRecordRow from '../components/PaymentRecordRow';
import ImageViewerModal from '../components/ImageViewerModal';
import { charityItems, CharityItem } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePayments, PaymentRecord } from '../context/PaymentContext';
import AppText from '../components/AppText';

export default function CharityScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getUserPaymentRecords } = usePayments();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<CharityItem | null>(null);
  const [amount, setAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [recordsByItem, setRecordsByItem] = useState<Record<string, PaymentRecord[]>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const canManageAccount = user ? ['treasurer', 'admin', 'chairman'].includes(user.role) : false;
  const isDependent = !!user?.dependentOf;

  const contributedTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of charityItems) {
      totals[item.id] = (recordsByItem[item.id] ?? []).reduce((sum, r) => sum + r.amount, 0);
    }
    return totals;
  }, [recordsByItem]);

  const loadTotals = useCallback(async () => {
    if (!user) return;
    const byItem: Record<string, PaymentRecord[]> = {};
    for (const item of charityItems) {
      byItem[item.id] = await getUserPaymentRecords(user.email, item.id);
    }
    setRecordsByItem(byItem);
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      loadTotals();
    }, [loadTotals])
  );

  const openItem = (item: CharityItem) => {
    setSelected(item);
    setAmount(String(item.suggestedAmount));
  };

  const closeAmountModal = () => {
    setSelected(null);
    setAmount('');
  };

  const handleRecorded = () => {
    setShowDetails(false);
    setSelected(null);
    setAmount('');
    loadTotals();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('charity.title')} subtitle={t('charity.subtitle')} />

      {isDependent && (
        <View style={styles.dependentBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <AppText style={styles.dependentBannerText}>
            {t('charity.dependentBanner', { guardian: user?.dependentOf ?? '' })}
          </AppText>
        </View>
      )}

      {canManageAccount && (
        <TouchableOpacity
          style={styles.manageCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('BankAccountSettings')}
        >
          <View style={styles.manageIconWrap}>
            <Ionicons name="wallet-outline" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText style={styles.manageTitle}>{t('charity.manageBank')}</AppText>
            <AppText style={styles.manageSubtitle} numberOfLines={2}>
              {t('charity.manageBankHint')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      <FlatList
        data={charityItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const contributed = contributedTotals[item.id] ?? 0;
          const records = recordsByItem[item.id] ?? [];
          const expanded = !!expandedItems[item.id];
          return (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="heart" size={20} color={colors.white} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <AppText style={typography.h3}>{item.title}</AppText>
                <AppText style={[typography.caption, { marginTop: 2 }]} numberOfLines={2}>
                  {item.description}
                </AppText>
                {contributed > 0 && (
                  <AppText style={styles.contributedText}>
                    {t('charity.contributed', { amount: contributed.toFixed(2) })}
                  </AppText>
                )}
                {!isDependent && (
                  <Button
                    label={t('charity.contributeNow')}
                    variant="secondary"
                    onPress={() => openItem(item)}
                    style={{ marginTop: spacing.sm }}
                  />
                )}
                {records.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={styles.historyToggle}
                      onPress={() => setExpandedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    >
                      <AppText style={styles.historyToggleText}>
                        {t(expanded ? 'paymentHistory.hideHistory' : 'paymentHistory.viewHistory', {
                          count: records.length,
                        })}
                      </AppText>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
                    </TouchableOpacity>
                    {expanded && (
                      <View style={styles.historyList}>
                        {records.map((record) => (
                          <PaymentRecordRow key={record.id} record={record} onPressReceipt={setViewerUri} />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        }}
      />

      <ImageViewerModal visible={!!viewerUri} uri={viewerUri} onClose={() => setViewerUri(null)} />

      {selected && (
        <AppModal visible={!showDetails} onClose={closeAmountModal}>
          <AppText style={typography.h3}>{selected.title}</AppText>
          <AppText style={[typography.caption, { marginTop: spacing.xs }]}>{t('charity.enterAmount')}</AppText>
          <View style={styles.amountWrap}>
            <AppText style={styles.currencyPrefix}>RM</AppText>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.amountInput} />
          </View>
          <View style={styles.modalActions}>
            <Button label={t('common.cancel')} variant="ghost" onPress={closeAmountModal} style={{ flex: 1 }} />
            <Button
              label={t('common.continueLabel')}
              onPress={() => setShowDetails(true)}
              disabled={!amount || Number(amount) <= 0}
              style={{ flex: 1 }}
            />
          </View>
        </AppModal>
      )}

      {selected && (
        <PaymentDetailsModal
          visible={showDetails}
          onClose={() => setShowDetails(false)}
          onRecorded={handleRecorded}
          feeId={selected.id}
          title={selected.title}
          feeType="khairat"
          amount={Number(amount) || 0}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    historyToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    historyToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    historyList: {
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dependentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: withAlpha(colors.primary, 0.08),
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
    },
    dependentBannerText: {
      flex: 1,
      fontSize: 12,
      color: colors.primaryDark,
      lineHeight: 17,
    },
    manageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      ...shadow.card,
    },
    manageIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    manageTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    manageSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 16,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadow.card,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contributedText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginTop: spacing.sm,
    },
    amountWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      marginVertical: spacing.md,
      gap: spacing.xs,
    },
    currencyPrefix: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    amountInput: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
  });
