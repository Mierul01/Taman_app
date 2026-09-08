import React, { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, User } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';
import {
  Program,
  categoryColors,
  categoryIcons,
  emergencyContacts,
  feeItems,
  notifications,
  formatNotificationDate,
} from '../data/mockData';
import { getAllPrograms } from '../data/programsStore';
import HighlightCarousel from '../components/HighlightCarousel';
import AppText from '../components/AppText';
import Button from '../components/Button';
import { toTitleCase } from '../utils/formatName';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

const totalFeeAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
const FEE_RING_SIZE = 56;
const FEE_RING_STROKE = 5;
const FEE_RING_RADIUS = (FEE_RING_SIZE - FEE_RING_STROKE) / 2;
const FEE_RING_CIRCUMFERENCE = 2 * Math.PI * FEE_RING_RADIUS;
const EXPLORE_CATEGORIES: Program['category'][] = ['Sukan', 'Gotong-Royong', 'Perayaan', 'Kursus'];

// Hand-picked stock placeholder photos (Lorem Picsum — free, royalty-free) shown
// until a park's AJK uploads a real photo for a program of that category.
const CATEGORY_FALLBACK_IMAGES: Record<Program['category'], string> = {
  Sukan: 'https://picsum.photos/id/1058/800/450', // stadium field
  'Gotong-Royong': 'https://picsum.photos/id/1043/800/450', // park/forest
  Perayaan: 'https://picsum.photos/id/225/800/450', // flowers, festive
  Kursus: 'https://picsum.photos/id/431/800/450', // coffee & notes, workshop feel
};

export default function DashboardScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, getParkUsers } = useAuth();
  const { getUserPaymentRecords } = usePayments();
  const [upcoming, setUpcoming] = useState<Program[]>([]);
  const [upcomingAll, setUpcomingAll] = useState<Program[]>([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [paidByItem, setPaidByItem] = useState<Record<string, number>>({});
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const [committeePreview, setCommitteePreview] = useState<User[]>([]);
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
        setUpcomingAll(next);
        setUpcoming(next.slice(0, 5));
      });
    }, [user?.parkName])
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        let paid = 0;
        const byItem: Record<string, number> = {};
        for (const item of feeItems) {
          const records = await getUserPaymentRecords(user.email, item.id);
          const itemPaid = records.reduce((sum, r) => sum + r.amount, 0);
          byItem[item.id] = itemPaid;
          paid += itemPaid;
        }
        setPaidTotal(paid);
        setPaidByItem(byItem);
      })();
    }, [user?.email])
  );

  useFocusEffect(
    useCallback(() => {
      if (!user?.parkName) return;
      getParkUsers(user.parkName).then((parkUsers) => {
        setResidentCount(parkUsers.length);
        setCommitteePreview(
          parkUsers
            .filter((u) => u.role !== 'resident' && u.email !== user.email)
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 2)
        );
      });
    }, [user?.parkName, user?.email])
  );

  const callNumber = (phone: string) => Linking.openURL(`tel:${phone}`);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Program['category'], number>> = {};
    upcomingAll.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [upcomingAll]);

  const feeRemaining = Math.max(0, totalFeeAmount - paidTotal);
  const feePct = Math.min(100, Math.round((paidTotal / totalFeeAmount) * 100));

  const upcomingWithImages = useMemo(
    () => upcoming.map((program) => ({ ...program, imageUri: program.imageUri ?? CATEGORY_FALLBACK_IMAGES[program.category] })),
    [upcoming]
  );

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

      {upcomingWithImages.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <HighlightCarousel
            programs={upcomingWithImages}
            onPressItem={(program) => (navigation as any).navigate('ProgramDetail', { programId: program.id })}
          />
        </View>
      ) : (
        <View style={[styles.upcomingCard, { marginTop: spacing.lg }]}>
          <AppText style={typography.caption}>{t('dashboard.noUpcoming')}</AppText>
        </View>
      )}

      <AppText style={styles.sectionTitle}>{t('dashboard.exploreCategories')}</AppText>
      <View style={styles.exploreGrid}>
        {EXPLORE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.exploreCard, { backgroundColor: categoryColors[cat] }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Programs', { category: cat })}
          >
            <Ionicons
              name={categoryIcons[cat]}
              size={70}
              color="rgba(255,255,255,0.16)"
              style={styles.exploreWatermark}
            />
            <View style={styles.exploreIconWrap}>
              <Ionicons name={categoryIcons[cat]} size={20} color={colors.white} />
            </View>
            <AppText style={styles.exploreLabel}>{t(`category.${cat}`)}</AppText>
            <AppText style={styles.exploreCount}>
              {t('dashboard.categoryCount', { count: categoryCounts[cat] ?? 0 })}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.feeCard}>
        <TouchableOpacity
          style={styles.feeCardTop}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Payments')}
        >
          <View style={styles.feeRingWrap}>
            <Svg
              width={FEE_RING_SIZE}
              height={FEE_RING_SIZE}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={FEE_RING_SIZE / 2}
                cy={FEE_RING_SIZE / 2}
                r={FEE_RING_RADIUS}
                stroke={colors.border}
                strokeWidth={FEE_RING_STROKE}
                fill="none"
              />
              <Circle
                cx={FEE_RING_SIZE / 2}
                cy={FEE_RING_SIZE / 2}
                r={FEE_RING_RADIUS}
                stroke={colors.primary}
                strokeWidth={FEE_RING_STROKE}
                fill="none"
                strokeDasharray={`${FEE_RING_CIRCUMFERENCE} ${FEE_RING_CIRCUMFERENCE}`}
                strokeDashoffset={FEE_RING_CIRCUMFERENCE * (1 - feePct / 100)}
                strokeLinecap="round"
              />
            </Svg>
            <AppText style={styles.feeRingLabel}>{feePct}%</AppText>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText style={styles.feeTitle}>{t('dashboard.feeStatusTitle')}</AppText>
            <AppText style={styles.feeSummary}>
              {t('dashboard.feeProgress', { paid: paidTotal.toFixed(2), total: totalFeeAmount.toFixed(2) })}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.feeToggleRow}
          activeOpacity={0.7}
          onPress={() => setFeeExpanded((v) => !v)}
        >
          <AppText style={styles.feeToggleText}>
            {feeExpanded ? t('dashboard.feeHideBreakdown') : t('dashboard.feeBreakdown')}
          </AppText>
          <Ionicons
            name={feeExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>

        {feeExpanded && (
          <View style={styles.feeItemList}>
            {feeItems.map((item) => {
              const itemPaid = paidByItem[item.id] ?? 0;
              const isPaid = itemPaid >= item.amount;
              const badgeColor = isPaid ? '#1B7A43' : '#D9862E';
              return (
                <View key={item.id} style={styles.feeItemRow}>
                  <Ionicons
                    name={isPaid ? 'checkmark-circle' : 'time-outline'}
                    size={16}
                    color={badgeColor}
                  />
                  <AppText style={styles.feeItemTitle} numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <View style={[styles.feeItemBadge, { backgroundColor: withAlpha(badgeColor, 0.12) }]}>
                    <AppText style={[styles.feeItemBadgeText, { color: badgeColor }]}>
                      {isPaid ? t('dashboard.feePaid') : t('dashboard.feeUnpaid')}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

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
            onPress={() => navigation.navigate(n.target)}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: withAlpha(n.color, 0.12) }]}>
              <Ionicons name={n.icon} size={20} color={n.color} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={styles.notifTitleRow}>
                <AppText style={styles.notifTitle} numberOfLines={1}>
                  {t(n.titleKey)}
                </AppText>
                {n.unread && <View style={styles.notifDot} />}
              </View>
              <AppText style={styles.notifBody} numberOfLines={2}>
                {t(n.bodyKey)}
              </AppText>
              <AppText style={styles.notifTime}>{formatNotificationDate(n.hoursAgo, notifLocale)}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {committeePreview.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <AppText style={styles.sectionTitle}>{t('committee.committeeSection')}</AppText>
            <AppText style={styles.linkText} onPress={() => navigation.navigate('Committee')}>
              {t('dashboard.viewAll')}
            </AppText>
          </View>
          <View style={styles.committeeList}>
            {committeePreview.map((member) => (
              <TouchableOpacity
                key={member.email}
                style={styles.committeeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Committee')}
              >
                <View style={styles.committeeAvatar}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <AppText style={styles.committeeName} numberOfLines={1}>
                    {toTitleCase(member.name)}
                  </AppText>
                  <AppText style={styles.committeeRole}>{t(`role.${member.role}`)}</AppText>
                </View>
                <TouchableOpacity
                  style={styles.committeeCallButton}
                  activeOpacity={0.8}
                  onPress={() => callNumber(member.phone)}
                >
                  <Ionicons name="call" size={16} color={colors.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <AppText style={styles.sectionTitle}>{t('dashboard.emergencyContacts')}</AppText>
      <View style={styles.emergencyRow}>
        {emergencyPreview.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => callNumber(c.phone)}
          >
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="call" size={16} color={colors.danger} />
            </View>
            <AppText style={styles.emergencyRole} numberOfLines={1}>
              {t(`emergencyContact.${c.id}Role`)}
            </AppText>
            <AppText style={styles.emergencyPhone}>{c.phone}</AppText>
          </TouchableOpacity>
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
    feeRingWrap: {
      width: FEE_RING_SIZE,
      height: FEE_RING_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    feeRingLabel: {
      position: 'absolute',
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
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
    feeCardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
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
    feeToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    feeToggleText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.primary,
    },
    feeItemList: {
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    feeItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 6,
    },
    feeItemTitle: {
      flex: 1,
      fontSize: 12.5,
      color: colors.text,
    },
    feeItemBadge: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    feeItemBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    exploreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: spacing.lg,
      rowGap: spacing.sm,
    },
    exploreCard: {
      width: '48%',
      height: 130,
      borderRadius: radius.lg,
      padding: spacing.md,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      ...shadow.card,
    },
    exploreWatermark: {
      position: 'absolute',
      right: -14,
      top: -12,
    },
    exploreIconWrap: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    exploreLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.white,
    },
    exploreCount: {
      fontSize: 11.5,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2,
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
      padding: spacing.md,
      ...shadow.card,
    },
    notifIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    notifTitle: {
      flexShrink: 1,
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    notifDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.danger,
    },
    notifBody: {
      fontSize: 12.5,
      lineHeight: 17,
      color: colors.textMuted,
      marginTop: 2,
    },
    notifTime: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
    },
    committeeList: {
      marginHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    committeeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.sm,
      ...shadow.card,
    },
    committeeAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withAlpha(colors.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    committeeName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    committeeRole: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 1,
    },
    committeeCallButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
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
