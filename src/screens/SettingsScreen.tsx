import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography, useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { isDarkMode, setDarkMode } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { logout, deleteAccount } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteAccount();
    setDeleting(false);
    setConfirmDelete(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, language === 'ms' && styles.chipActive]}
              onPress={() => setLanguage('ms')}
            >
              <Text style={[styles.chipText, language === 'ms' && styles.chipTextActive]}>
                {t('settings.languageMalay')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, language === 'en' && styles.chipActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.chipText, language === 'en' && styles.chipTextActive]}>
                {t('settings.languageEnglish')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.display')}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="moon-outline" size={18} color={colors.text} />
              <Text style={styles.rowText}>{t('settings.darkMode')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.rowBorder} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={18} color={colors.text} />
              <Text style={styles.rowText}>{t('settings.pushNotifications')}</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ProfileEdit')}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-outline" size={18} color={colors.text} />
              <Text style={styles.rowText}>{t('profile.updateProfile')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.rowBorder} />
          <TouchableOpacity style={styles.row} onPress={() => setConfirmLogout(true)}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={18} color={colors.text} />
              <Text style={styles.rowText}>{t('profile.logOut')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.about')}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={18} color={colors.text} />
              <Text style={styles.rowText}>{t('settings.appVersion')}</Text>
            </View>
            <Text style={typography.caption}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.danger }]}>{t('settings.dangerZone')}</Text>
          <Button label={t('settings.deleteAccount')} variant="danger" onPress={() => setConfirmDelete(true)} />
        </View>
      </ScrollView>

      <AppModal visible={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <Text style={[typography.h3, { textAlign: 'center' }]}>{t('profile.logOutConfirmTitle')}</Text>
        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs }]}>
          {t('profile.logOutConfirmBody')}
        </Text>
        <View style={styles.modalActions}>
          <Button label={t('common.cancel')} variant="ghost" onPress={() => setConfirmLogout(false)} style={{ flex: 1 }} />
          <Button label={t('profile.logOut')} variant="danger" onPress={handleLogout} style={{ flex: 1 }} />
        </View>
      </AppModal>

      <AppModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <View style={styles.warnIcon}>
          <Ionicons name="warning" size={26} color={colors.white} />
        </View>
        <Text style={[typography.h3, { textAlign: 'center', marginTop: spacing.md }]}>
          {t('settings.deleteConfirmTitle')}
        </Text>
        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs }]}>
          {t('settings.deleteConfirmBody')}
        </Text>
        <View style={styles.modalActions}>
          <Button label={t('common.cancel')} variant="ghost" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
          <Button label={t('settings.deleteAccount')} variant="danger" onPress={handleDelete} loading={deleting} style={{ flex: 1 }} />
        </View>
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    rowBorder: {
      height: 1,
      backgroundColor: colors.border,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowText: {
      fontSize: 14,
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    warnIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    chipRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipTextActive: {
      color: colors.white,
    },
  });
