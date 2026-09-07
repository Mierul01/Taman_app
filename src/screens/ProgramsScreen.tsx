import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import MonthCalendar from '../components/MonthCalendar';
import Button from '../components/Button';
import { Program, categoryColors as categoryColor } from '../data/mockData';
import { getAllPrograms } from '../data/programsStore';
import { useAuth } from '../context/AuthContext';
import AppText from '../components/AppText';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatSelected(dateISO: string, locale: string) {
  const d = new Date(`${dateISO}T00:00:00`);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProgramsScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t, language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

  const canAddProgram = user ? ['admin', 'ajk', 'chairman', 'treasurer'].includes(user.role) : false;

  useFocusEffect(
    useCallback(() => {
      getAllPrograms().then((all) =>
        setAllPrograms(all.filter((p) => !p.parkName || p.parkName === user?.parkName))
      );
    }, [user?.parkName])
  );

  const markedDates = useMemo(() => {
    const marks: Record<string, { color: string }> = {};
    allPrograms.forEach((p) => {
      marks[p.dateISO] = { color: categoryColor[p.category] };
    });
    return marks;
  }, [allPrograms]);

  const handleSelectDate = (iso: string) => {
    setSelectedDate((current) => (current === iso ? null : iso));
  };

  const today = todayISO();
  const upcomingPrograms = useMemo(
    () =>
      allPrograms
        .filter((p) => p.dateISO >= today)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [allPrograms, today]
  );
  const programsForSelectedDate = selectedDate ? allPrograms.filter((p) => p.dateISO === selectedDate) : [];

  const isDefaultView = selectedDate === null;
  const listTitle = isDefaultView ? t('programs.upcoming') : formatSelected(selectedDate, language === 'ms' ? 'ms-MY' : 'en-GB');
  const listPrograms = isDefaultView ? upcomingPrograms : programsForSelectedDate;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('programs.title')} subtitle={t('programs.subtitle')} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.calendarCard}>
          <MonthCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} markedDates={markedDates} />
        </View>

        {canAddProgram && (
          <Button
            label={t('programs.addProgram')}
            variant="secondary"
            onPress={() => navigation.navigate('AddProgram')}
            style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}
          />
        )}

        <View style={styles.sectionRow}>
          <AppText style={styles.sectionTitle}>{listTitle}</AppText>
          {listPrograms.length > 0 && (
            <View style={styles.countBadge}>
              <AppText style={styles.countBadgeText}>{listPrograms.length}</AppText>
            </View>
          )}
        </View>
        {!isDefaultView && (
          <AppText style={styles.resetLink} onPress={() => setSelectedDate(null)}>
            {t('programs.backToUpcoming')}
          </AppText>
        )}

        {listPrograms.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
            <AppText style={styles.emptyText}>
              {isDefaultView ? t('programs.noUpcoming') : t('programs.noneOnDate')}
            </AppText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
            {listPrograms.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProgramDetail', { programId: item.id })}
              >
                <View style={styles.rowTop}>
                  <View style={[styles.badge, { backgroundColor: categoryColor[item.category] }]}>
                    <AppText style={styles.badgeText}>{t(`category.${item.category}`)}</AppText>
                  </View>
                  <AppText style={typography.caption}>{item.date}</AppText>
                </View>
                <AppText style={[typography.h3, { marginTop: spacing.sm }]}>{item.title}</AppText>
                <AppText style={[typography.body, styles.desc]} numberOfLines={2}>
                  {item.description}
                </AppText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textMuted} />
                  <AppText style={typography.caption}>{item.location}</AppText>
                  <Ionicons name="chevron-forward" size={15} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    calendarCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      ...shadow.card,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    countBadge: {
      backgroundColor: withAlpha(colors.primary, 0.12),
      borderRadius: radius.full,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    countBadgeText: {
      color: colors.primaryDark,
      fontSize: 12,
      fontWeight: '700',
    },
    resetLink: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      color: colors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    rowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    badgeText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    desc: {
      marginTop: spacing.xs,
      color: colors.textMuted,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
  });
