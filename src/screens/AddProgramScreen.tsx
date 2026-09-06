import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Program } from '../data/mockData';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { addProgram } from '../data/programsStore';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProgram'>;

const CATEGORIES: Program['category'][] = ['Gotong-Royong', 'Sukan', 'Perayaan', 'Kursus'];

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplay(iso: string, locale: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AddProgramScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t, language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [dateISO, setDateISO] = useState(toISO(new Date()));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Program['category']>('Gotong-Royong');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      setError(t('common.required'));
      return;
    }
    setError('');
    setSaving(true);
    const program: Program = {
      id: `p_${Date.now()}`,
      title: title.trim(),
      date: formatDisplay(dateISO, language === 'ms' ? 'ms-MY' : 'en-GB'),
      dateISO,
      location: location.trim(),
      description: description.trim(),
      category,
      parkName: user?.parkName,
      createdBy: user?.email,
    };
    await addProgram(program);
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('addProgram.title')} subtitle={t('addProgram.subtitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.fieldLabel}>{t('addProgram.programTitle')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('addProgram.programTitlePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('addProgram.date')}</Text>
        <TextInput
          value={dateISO}
          onChangeText={setDateISO}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('addProgram.category')}</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{t(`category.${c}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>{t('addProgram.location')}</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder={t('addProgram.locationPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('addProgram.description')}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('addProgram.descriptionPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={t('addProgram.submit')} onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 48,
      fontSize: 14,
      color: colors.text,
    },
    textArea: {
      height: 100,
      paddingTop: spacing.sm,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipTextActive: {
      color: colors.white,
    },
    error: {
      color: colors.danger,
      marginTop: spacing.md,
      fontSize: 13,
    },
  });
