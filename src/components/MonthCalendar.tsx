import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const WEEKDAYS: Record<'ms' | 'en', string[]> = {
  ms: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const MONTH_NAMES: Record<'ms' | 'en', string[]> = {
  ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function toISO(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

type Props = {
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  markedDates?: Record<string, { color: string }>;
};

export default function MonthCalendar({ selectedDate, onSelectDate, markedDates = {} }: Props) {
  const colors = useThemeColors();
  const { language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const initial = new Date(`${selectedDate ?? new Date().toISOString().slice(0, 10)}T00:00:00`);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const todayISO = toISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const items: { day: number; iso: string }[] = [];
    for (let i = 0; i < startWeekday; i++) {
      items.push({ day: 0, iso: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ day: d, iso: toISO(viewYear, viewMonth, d) });
    }
    while (items.length % 7 !== 0) {
      items.push({ day: 0, iso: '' });
    }
    return items;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[language][viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={goNextMonth} style={styles.navButton} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS[language].map((w) => (
          <Text key={w} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell.day) {
            return <View key={idx} style={styles.dayCell} />;
          }
          const isSelected = cell.iso === selectedDate;
          const isToday = cell.iso === todayISO;
          const mark = markedDates[cell.iso];
          return (
            <TouchableOpacity
              key={idx}
              style={styles.dayCell}
              activeOpacity={0.7}
              onPress={() => onSelectDate(cell.iso)}
            >
              <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                <Text
                  style={[
                    styles.dayText,
                    isToday && !isSelected && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
              {mark && !isSelected && <View style={[styles.dot, { backgroundColor: mark.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    weekRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.sm,
    },
    weekdayText: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      paddingBottom: spacing.xs,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    dayCell: {
      width: `${100 / 7}%`,
      height: CELL_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleSelected: {
      backgroundColor: colors.primary,
    },
    dayText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    dayTextToday: {
      color: colors.primary,
      fontWeight: '700',
    },
    dayTextSelected: {
      color: colors.white,
      fontWeight: '700',
    },
    dot: {
      position: 'absolute',
      bottom: 3,
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
  });
