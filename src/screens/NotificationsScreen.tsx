import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type NotificationDef = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  titleKey: string;
  bodyKey: string;
  timeKey: string;
  unread?: boolean;
};

const notifications: NotificationDef[] = [
  { id: 'n1', icon: 'card', color: '#2E6FD9', titleKey: 'notifications.n1title', bodyKey: 'notifications.n1body', timeKey: 'notifications.time2h', unread: true },
  { id: 'n2', icon: 'calendar', color: '#1B7A43', titleKey: 'notifications.n2title', bodyKey: 'notifications.n2body', timeKey: 'notifications.time1d', unread: true },
  { id: 'n3', icon: 'heart', color: '#D9862E', titleKey: 'notifications.n3title', bodyKey: 'notifications.n3body', timeKey: 'notifications.time3d' },
  { id: 'n4', icon: 'people', color: '#B23B6B', titleKey: 'notifications.n4title', bodyKey: 'notifications.n4body', timeKey: 'notifications.time1w' },
];

export default function NotificationsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
                <Text style={typography.h3}>{t(n.titleKey)}</Text>
                {n.unread && <View style={styles.dot} />}
              </View>
              <Text style={[typography.body, { marginTop: 2 }]}>{t(n.bodyKey)}</Text>
              <Text style={styles.time}>{t(n.timeKey)}</Text>
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
