import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'PdpaNotice'>;

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function PdpaNoticeScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('pdpa.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          </View>
          <AppText style={styles.introText}>{t('pdpa.intro')}</AppText>
        </View>

        {SECTION_KEYS.map((key) => (
          <View key={key} style={styles.section}>
            <AppText style={styles.sectionTitle}>{t(`pdpa.${key}Title`)}</AppText>
            <AppText style={styles.sectionBody}>{t(`pdpa.${key}Body`)}</AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    introCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: withAlpha(colors.primary, 0.08),
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    introIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    introText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionBody: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
    },
  });
