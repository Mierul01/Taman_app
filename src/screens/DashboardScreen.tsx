import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';
import { Program, emergencyContacts, feeItems, notifications, formatNotificationDate } from '../data/mockData';
import { getAllPrograms } from '../data/programsStore';
import HighlightCarousel from '../components/HighlightCarousel';
import AppText from '../components/AppText';
import Button from '../components/Button';
import { toTitleCase } from '../utils/formatName';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

const totalFeeAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

export default function DashboardScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, getParkUsers } = useAuth();
  const { getUserPaymentRecords } = usePayments();
  const [upcoming, setUpcoming] = useState<Program[]>([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const emergencyPreview = emergencyContacts.slice(0, 2);
  const recentNotifications = notifications.slice(0, 2);
  const notifLocale = language === 'ms' ? 'ms-MY' : 'en-GB';
  const isDependent = !!user?.dependentOf;

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().slice(0, 10);
      getAllPrograms().then((all) => {
        const scoped = all.filter((p) => !p.parkName || p.parkName === user?.parkName);
        const next = scoped.filter((p) => p.dateISO >= today).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
        setUpcoming(next.slice(0, 5));
      });
    }, [user?.parkName])
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        let paid = 0;
        for (const item of feeItems) {
          const records = await getUserPaymentRecords(user.email, item.id);
          paid += records.reduce((sum, r) => sum + r.amount, 0);
        }
        setPaidTotal(paid);
      })();
    }, [user?.email])
  );

  useFocusEffect(
    useCallback(() => {
      if (!user?.parkName) return;
      getParkUsers(user.parkName).then((residents) => setResidentCount(residents.length));
    }, [user?.parkName])
  );

  const feeRemaining = Math.max(0, totalFeeAmount - paidTotal);
  const feePct = Math.min(100, Math.round((paidTotal / totalFeeAmount) * 100));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.headerBlock}>
        <Ionicons name="leaf" size={130} color="rgba(255,255,255,0.08)" style={styles.headerWatermark} />
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.topBarBrand}>
            <View style={styles.topBarLogo}>
              <Ionicons name="leaf" size={16} color={colors.white} />
            </View>
            <AppText style={styles.topBarTitle}>{t('common.appName').toUpperCase()}</AppText>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={19} color={colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={19} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <AppText style={styles.greetingCaption}>{t('dashboard.welcome')}</AppText>
            <AppText style={styles.greetingName} numberOfLines={1} ellipsizeMode="tail">
              {user?.name ? toTitleCase(user.name) : t('role.resident')}
            </AppText>
            <AppText style={styles.greetingSubtitle} numberOfLines={1}>
              {user?.parkName}
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.feeCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Payments')}
      >
        <View style={styles.feeCardTop}>
          <View style={styles.feeIconWrap}>
            <Ionicons name="card" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText style={styles.feeTitle}>{t('dashboard.feeStatusTitle')}</AppText>
            <AppText style={styles.feeSummary}>
              {t('dashboard.feeProgress', { paid: paidTotal.toFixed(2), total: totalFeeAmount.toFixed(2) })}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
        <View style={styles.feeProgressTrack}>
          <View style={[styles.feeProgressFill, { width: `${feePct}%` }]} />
        </View>
        <View style={styles.feeCardBottom}>
          <AppText style={styles.feeStatusLabel}>
            {feeRemaining > 0
              ? t('dashboard.feeRemaining', { remaining: feeRemaining.toFixed(2) })
              : t('dashboard.feeAllSettled')}
          </AppText>
          {!isDependent && feeRemaining > 0 && (
            <Button
              label={t('payments.payNow')}
              onPress={() => navigation.navigate('Payments')}
              style={styles.feeButton}
            />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.statsCard}>
        <TouchableOpacity
          style={styles.statTile}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Committee')}
        >
          <View style={[styles.statIconWrap, { backgroundColor: withAlpha('#2E6FD9', 0.12) }]}>
            <Ionicons name="people" size={17} color="#2E6FD9" />
          </View>
          <AppText style={styles.statValue}>{residentCount ?? '—'}</AppText>
          <AppText style={styles.statLabel}>{t('dashboard.statResidents')}</AppText>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statTile}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Programs')}
        >
          <View style={[styles.statIconWrap, { backgroundColor: withAlpha('#1B7A43', 0.12) }]}>
            <Ionicons name="calendar" size={17} color="#1B7A43" />
          </View>
          <AppText style={styles.statValue}>{upcoming.length}</AppText>
          <AppText style={styles.statLabel}>{t('dashboard.statPrograms')}</AppText>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statTile}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.statIconWrap, { backgroundColor: withAlpha('#D9862E', 0.12) }]}>
            <Ionicons name="home" size={17} color="#D9862E" />
          </View>
          <AppText style={styles.statValue}>{(user?.familyMembers?.length ?? 0) + 1}</AppText>
          <AppText style={styles.statLabel}>{t('dashboard.statFamily')}</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <AppText style={styles.sectionTitle}>{t('dashboard.upcomingPrograms')}</AppText>
        <AppText style={styles.linkText} onPress={() => navigation.navigate('Programs')}>
          {t('dashboard.viewAll')}
        </AppText>
      </View>
      {upcoming.length > 0 ? (
        <HighlightCarousel
          programs={upcoming}
          onPressItem={(program) => (navigation as any).navigate('ProgramDetail', { programId: program.id })}
        />
      ) : (
        <View style={styles.upcomingCard}>
          <AppText style={typography.caption}>{t('dashboard.noUpcoming')}</AppText>
        </View>
      )}

      <View style={styles.sectionRow}>
        <AppText style={styles.sectionTitle}>{t('dashboard.recentNotifications')}</AppText>
        <AppText style={styles.linkText} onPress={() => (navigation as any).navigate('Notifications')}>
          {t('dashboard.viewAll')}
        </AppText>
      </View>
      <View style={styles.notifList}>
        {recentNotifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={styles.notifCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('Notifications')}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: withAlpha(n.color, 0.12) }]}>
              <Ionicons name={n.icon} size={16} color={n.color} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.notifTitleRow}>
                <AppText style={styles.notifTitle} numberOfLines={1}>
                  {t(n.titleKey)}
                </AppText>
                {n.unread && <View style={styles.notifDot} />}
              </View>
              <AppText style={styles.notifBody} numberOfLines={1}>
                {t(n.bodyKey)}
              </AppText>
            </View>
            <AppText style={styles.notifTime}>{formatNotificationDate(n.hoursAgo, notifLocale)}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>{t('dashboard.emergencyContacts')}</AppText>
      <View style={styles.emergencyRow}>
        {emergencyPreview.map((c) => (
          <View key={c.id} style={styles.emergencyCard}>
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="call" size={16} color={colors.danger} />
            </View>
            <AppText style={styles.emergencyRole} numberOfLines={1}>
              {t(`emergencyContact.${c.id}Role`)}
            </AppText>
            <AppText style={styles.emergencyPhone}>{c.phone}</AppText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    headerBlock: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
      overflow: 'hidden',
      paddingBottom: spacing.lg,
    },
    headerWatermark: {
      position: 'absolute',
      right: -20,
      top: -20,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    topBarBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    topBarLogo: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.white,
      letterSpacing: 0.5,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    notificationDot: {
      position: 'absolute',
      top: 8,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    headerTextWrap: {
      flex: 1,
      minWidth: 0,
      marginRight: spacing.md,
    },
    greetingCaption: {
      fontSize: 13,
      color: colors.primaryLight,
    },
    greetingName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
    },
    greetingSubtitle: {
      fontSize: 13,
      color: colors.primaryLight,
      marginTop: 2,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
    feeCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    feeCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    feeIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsCard: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      marginTop: spacing.sm,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      ...shadow.card,
    },
    statTile: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 2,
    },
    feeTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    feeSummary: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    feeProgressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: spacing.md,
      overflow: 'hidden',
    },
    feeProgressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    feeCardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    feeStatusLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
    },
    feeButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    upcomingCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.md,
      ...shadow.card,
    },
    notifList: {
      marginHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    notifCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.sm,
      ...shadow.card,
    },
    notifIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    notifTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    notifDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    notifBody: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 1,
    },
    notifTime: {
      fontSize: 10.5,
      color: colors.textMuted,
      marginLeft: spacing.sm,
    },
    emergencyRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    emergencyCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    emergencyIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: withAlpha('#D64545', 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emergencyRole: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    emergencyPhone: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
  });
