import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Program, emergencyContacts } from '../data/mockData';
import { getAllPrograms } from '../data/programsStore';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

type MenuItem = {
  key: keyof MainTabParamList;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const baseMenuItems: MenuItem[] = [
  { key: 'Programs', labelKey: 'dashboard.programs', icon: 'calendar', color: '#1B7A43' },
  { key: 'Payments', labelKey: 'dashboard.payments', icon: 'card', color: '#2E6FD9' },
  { key: 'Charity', labelKey: 'dashboard.charity', icon: 'heart', color: '#D9862E' },
  { key: 'Committee', labelKey: 'dashboard.committee', icon: 'people', color: '#B23B6B' },
];

const collectionsMenuItem: MenuItem = {
  key: 'Collections',
  labelKey: 'dashboard.collections',
  icon: 'stats-chart',
  color: '#6B4EE0',
};

export default function DashboardScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Program | null>(null);
  const menuItems = user && user.role !== 'resident' ? [...baseMenuItems, collectionsMenuItem] : baseMenuItems;
  const emergencyPreview = emergencyContacts.slice(0, 2);

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().slice(0, 10);
      getAllPrograms().then((all) => {
        const scoped = all.filter((p) => !p.parkName || p.parkName === user?.parkName);
        const next = scoped.filter((p) => p.dateISO >= today).sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
        setUpcoming(next ?? null);
      });
    }, [user?.parkName])
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
            <Text style={styles.topBarTitle}>{t('common.appName').toUpperCase()}</Text>
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
            <Text style={styles.greetingCaption}>{t('dashboard.welcome')}</Text>
            <Text style={styles.greetingName} numberOfLines={1} ellipsizeMode="tail">
              {user?.name ?? t('role.resident')}
            </Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>
              {user?.parkName}
            </Text>
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

      <Text style={styles.sectionTitle}>{t('dashboard.mainMenu')}</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={[styles.menuIcon, { backgroundColor: withAlpha(item.color, 0.12) }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t('dashboard.upcomingPrograms')}</Text>
        <Text style={styles.linkText} onPress={() => navigation.navigate('Programs')}>
          {t('dashboard.viewAll')}
        </Text>
      </View>
      {upcoming ? (
        <TouchableOpacity style={styles.upcomingCard} activeOpacity={0.85} onPress={() => navigation.navigate('Programs')}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{upcoming.date.split(' ')[0]}</Text>
            <Text style={styles.dateBadgeMonth}>{upcoming.date.split(' ')[1]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>{upcoming.title}</Text>
            <Text style={typography.caption} numberOfLines={2}>
              {upcoming.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <View style={styles.upcomingCard}>
          <Text style={typography.caption}>{t('dashboard.noUpcoming')}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('dashboard.emergencyContacts')}</Text>
      <View style={styles.emergencyRow}>
        {emergencyPreview.map((c) => (
          <View key={c.id} style={styles.emergencyCard}>
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="call" size={16} color={colors.danger} />
            </View>
            <Text style={styles.emergencyRole} numberOfLines={1}>
              {t(`emergencyContact.${c.id}Role`)}
            </Text>
            <Text style={styles.emergencyPhone}>{c.phone}</Text>
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.lg - spacing.xs,
      gap: spacing.sm,
    },
    menuCard: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginHorizontal: spacing.xs / 2,
      ...shadow.card,
    },
    menuIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    menuLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
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
    dateBadge: {
      width: 52,
      height: 52,
      borderRadius: radius.sm,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateBadgeText: {
      fontWeight: '700',
      color: colors.primaryDark,
      fontSize: 16,
    },
    dateBadgeMonth: {
      fontSize: 11,
      color: colors.primaryDark,
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
