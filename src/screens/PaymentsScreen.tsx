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
import { FeeItem } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePayments, PaymentRecord } from '../context/PaymentContext';
import AppText from '../components/AppText';

export default function PaymentsScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getUserPaymentRecords, getFeeItems } = usePayments();
  const navigation = useNavigation<any>();
  const [feeItems, setFeeItemsState] = useState<FeeItem[]>([]);
  const [selected, setSelected] = useState<FeeItem | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [recordsByItem, setRecordsByItem] = useState<Record<string, PaymentRecord[]>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const canManageAccount = user ? ['treasurer', 'admin', 'chairman'].includes(user.role) : false;
  const isDependent = !!user?.dependentOf;

  const paidTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of feeItems) {
      totals[item.id] = (recordsByItem[item.id] ?? []).reduce((sum, r) => sum + r.amount, 0);
    }
    return totals;
  }, [recordsByItem, feeItems]);

  const loadTotals = useCallback(async () => {
    if (!user) return;
    const items = await getFeeItems(user.parkName);
    setFeeItemsState(items);
    const byItem: Record<string, PaymentRecord[]> = {};
    for (const item of items) {
      byItem[item.id] = await getUserPaymentRecords(user.email, item.id);
    }
    setRecordsByItem(byItem);
  }, [user?.email, user?.parkName]);

  useFocusEffect(
    useCallback(() => {
      loadTotals();
    }, [loadTotals])
  );

  const openItem = (item: FeeItem) => {
    const paid = paidTotals[item.id] ?? 0;
    const remaining = Math.max(0, item.amount - paid);
    setSelected(item);
    setPayAmount(remaining > 0 ? String(remaining) : String(item.amount));
  };

  const closeAmountModal = () => {
    setSelected(null);
    setPayAmount('');
  };

  const handleRecorded = () => {
    setShowDetails(false);
    setSelected(null);
    loadTotals();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      {isDependent && (
        <View style={styles.dependentBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <AppText style={styles.dependentBannerText}>
            {t('payments.dependentBanner', { guardian: user?.dependentOf ?? '' })}
          </AppText>
        </View>
      )}

      <FlatList
        data={feeItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          canManageAccount ? (
            <>
              <TouchableOpacity
                style={styles.manageCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('BankAccountSettings', { feeType: 'yuran' })}
              >
                <View style={styles.manageIconWrap}>
                  <Ionicons name="wallet-outline" size={20} color={colors.white} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <AppText style={styles.manageTitle}>{t('payments.manageBank')}</AppText>
                  <AppText style={styles.manageSubtitle} numberOfLines={2}>
                    {t('payments.manageBankHint')}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manageCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ManageFeeItems')}
              >
                <View style={styles.manageIconWrap}>
                  <Ionicons name="pricetag-outline" size={20} color={colors.white} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <AppText style={styles.manageTitle}>{t('payments.manageFees')}</AppText>
                  <AppText style={styles.manageSubtitle} numberOfLines={2}>
                    {t('payments.manageFeesHint')}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          ) : null
        }
        renderItem={({ item }) => {
          const paid = paidTotals[item.id] ?? 0;
          const remaining = Math.max(0, item.amount - paid);
          const pct = Math.min(100, Math.round((paid / item.amount) * 100));
          const records = recordsByItem[item.id] ?? [];
          const expanded = !!expandedItems[item.id];
          return (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="card-outline" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <AppText style={typography.h3}>{item.title}</AppText>
                <AppText style={[typography.caption, { marginTop: 2 }]} numberOfLines={2}>
                  {item.description}
                </AppText>
                <View style={styles.rowBetween}>
                  <AppText style={styles.amount}>RM {item.amount.toFixed(2)}</AppText>
                  <AppText style={styles.period}>{item.period}</AppText>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <AppText style={styles.progressLabel}>
                  {paid > 0
                    ? t('payments.paidAmount', { paid: paid.toFixed(2) }) +
                      (remaining > 0 ? t('payments.balance', { remaining: remaining.toFixed(2) }) : t('payments.complete'))
                    : t('payments.notPaid')}
                </AppText>
                {!isDependent && (
                  <Button
                    label={paid > 0 && remaining > 0 ? t('payments.payBalance') : t('payments.payNow')}
                    onPress={() => openItem(item)}
                    style={{ marginTop: spacing.sm }}
                    disabled={remaining <= 0}
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
          <AppText style={[typography.caption, { marginTop: spacing.xs }]}>{t('payments.enterAmount')}</AppText>
          <View style={styles.amountWrap}>
            <AppText style={styles.currencyPrefix}>RM</AppText>
            <TextInput value={payAmount} onChangeText={setPayAmount} keyboardType="numeric" style={styles.amountInput} />
          </View>
          <View style={styles.modalActions}>
            <Button label={t('common.cancel')} variant="ghost" onPress={closeAmountModal} style={{ flex: 1 }} />
            <Button
              label={t('common.continueLabel')}
              onPress={() => setShowDetails(true)}
              disabled={!payAmount || Number(payAmount) <= 0}
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
          feeType="yuran"
          amount={Number(payAmount) || 0}
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
      marginBottom: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      ...shadow.card,
    },
    manageIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
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
      backgroundColor: '#2E6FD9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    amount: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.primary,
    },
    period: {
      fontSize: 12,
      color: colors.textMuted,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    progressLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
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
