import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import { feeItems, charityItems, totalHouseholds } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePayments, PaymentRecord } from '../context/PaymentContext';
import AppText from '../components/AppText';

type ItemSummary = {
  id: string;
  title: string;
  collected: number;
  contributors: number;
};

function summarize(records: PaymentRecord[], items: { id: string; title: string }[]): ItemSummary[] {
  return items.map((item) => {
    const matching = records.filter((r) => r.feeId === item.id);
    const collected = matching.reduce((sum, r) => sum + r.amount, 0);
    const contributors = new Set(matching.map((r) => r.userEmail)).size;
    return { id: item.id, title: item.title, collected, contributors };
  });
}

function CollectionGroup({
  title,
  icon,
  color,
  records,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  records: ItemSummary[];
}) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const total = records.reduce((sum, r) => sum + r.collected, 0);
  return (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppText style={typography.h3}>{title}</AppText>
          <AppText style={typography.caption}>{t('collections.totalCollected', { amount: total.toLocaleString() })}</AppText>
        </View>
      </View>
      {records.map((r) => {
        const pct = Math.min(100, Math.round((r.contributors / totalHouseholds) * 100));
        return (
          <View key={r.id} style={styles.recordRow}>
            <View style={styles.recordTop}>
              <AppText style={styles.recordTitle} numberOfLines={1}>
                {r.title}
              </AppText>
              <AppText style={styles.recordAmount}>RM {r.collected.toLocaleString()}</AppText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <AppText style={styles.recordMeta}>
              {t('collections.contributorsLine', { count: r.contributors, total: totalHouseholds })}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

export default function CollectionsScreen() {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getParkPaymentRecords } = usePayments();
  const [feeSummaries, setFeeSummaries] = useState<ItemSummary[]>([]);
  const [charitySummaries, setCharitySummaries] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const records = await getParkPaymentRecords(user.parkName);
    setFeeSummaries(summarize(records.filter((r) => r.feeType === 'yuran'), feeItems));
    setCharitySummaries(summarize(records.filter((r) => r.feeType === 'khairat'), charityItems));
    setLoading(false);
  }, [user?.parkName]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalFees = feeSummaries.reduce((sum, r) => sum + r.collected, 0);
  const totalCharity = charitySummaries.reduce((sum, r) => sum + r.collected, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('collections.title')} subtitle={t('collections.subtitle', { park: user?.parkName ?? '' })} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="card" size={20} color="#2E6FD9" />
            <AppText style={styles.statValue}>RM {totalFees.toLocaleString()}</AppText>
            <AppText style={styles.statLabel}>{t('collections.totalFees')}</AppText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={20} color="#D9862E" />
            <AppText style={styles.statValue}>RM {totalCharity.toLocaleString()}</AppText>
            <AppText style={styles.statLabel}>{t('collections.totalCharity')}</AppText>
          </View>
        </View>

        {!loading && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: spacing.md }}>
            <CollectionGroup title={t('collections.feeCollections')} icon="card" color="#2E6FD9" records={feeSummaries} />
            <CollectionGroup title={t('collections.charityCollections')} icon="heart" color="#D9862E" records={charitySummaries} />
          </View>
        )}

        <AppText style={styles.footnote}>{t('collections.footnote', { total: totalHouseholds })}</AppText>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    groupCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    groupIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordRow: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    recordTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recordTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    recordAmount: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: spacing.xs,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    recordMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    footnote: {
      fontSize: 11,
      color: colors.textMuted,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      lineHeight: 16,
    },
  });
