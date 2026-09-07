import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import { notifications, formatNotificationDate } from '../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t, language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const locale = language === 'ms' ? 'ms-MY' : 'en-GB';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        {notifications.map((n) => (
          <View key={n.id} style={[styles.card, n.unread && styles.cardUnread]}>
            <View style={[styles.iconWrap, { backgroundColor: withAlpha(n.color, 0.12) }]}>
              <Ionicons name={n.icon} size={20} color={n.color} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={styles.titleRow}>
                <AppText style={typography.h3}>{t(n.titleKey)}</AppText>
                {n.unread && <View style={styles.dot} />}
              </View>
              <AppText style={[typography.body, { marginTop: 2 }]}>{t(n.bodyKey)}</AppText>
              <AppText style={styles.time}>
                {t(n.timeKey)} · {formatNotificationDate(n.hoursAgo, locale)}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    cardUnread: {
      borderWidth: 1,
      borderColor: withAlpha(colors.primary, 0.25),
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.danger,
    },
    time: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
