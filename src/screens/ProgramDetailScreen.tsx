import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import { getAllPrograms } from '../data/programsStore';
import { Program, categoryColors as categoryColor } from '../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramDetail'>;

export default function ProgramDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { programId } = route.params;
  const [program, setProgram] = useState<Program | null | undefined>(undefined);

  useEffect(() => {
    getAllPrograms().then((all) => {
      setProgram(all.find((p) => p.id === programId) ?? null);
    });
  }, [programId]);

  if (program === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title={t('programDetail.notFound')} onBack={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('programDetail.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.card}>
          <View style={[styles.badge, { backgroundColor: categoryColor[program.category] }]}>
            <Text style={styles.badgeText}>{t(`category.${program.category}`)}</Text>
          </View>
          <Text style={[typography.h2, { marginTop: spacing.md }]}>{program.title}</Text>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <Text style={styles.detailText}>{program.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <Text style={styles.detailText}>{program.location}</Text>
          </View>
          {program.parkName ? (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={18} color={colors.textMuted} />
              <Text style={styles.detailText}>{program.parkName}</Text>
            </View>
          ) : null}

          <Text style={styles.description}>{program.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      ...shadow.card,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    badgeText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    detailText: {
      fontSize: 14,
      color: colors.text,
    },
    description: {
      marginTop: spacing.lg,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textMuted,
    },
  });
