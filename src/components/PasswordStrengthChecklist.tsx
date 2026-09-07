import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

type CheckKey = keyof ReturnType<typeof getPasswordChecks>;

export default function PasswordStrengthChecklist({ password }: { password: string }) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!password) return null;

  const checks = getPasswordChecks(password);
  const items: { key: CheckKey; label: string }[] = [
    { key: 'minLength', label: t('register.checkMinLength') },
    { key: 'hasUpper', label: t('register.checkUpper') },
    { key: 'hasLower', label: t('register.checkLower') },
    { key: 'hasSpecial', label: t('register.checkSpecial') },
  ];

  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const ok = checks[item.key];
        return (
          <View key={item.key} style={styles.row}>
            <Ionicons
              name={ok ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={ok ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.label, ok && { color: colors.primary, fontWeight: '600' }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function PasswordMatchIndicator({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!confirmPassword) return null;
  const matches = password === confirmPassword;

  return (
    <View style={[styles.row, { marginTop: spacing.xs }]}>
      <Ionicons
        name={matches ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={matches ? colors.primary : colors.danger}
      />
      <Text style={[styles.label, { color: matches ? colors.primary : colors.danger, fontWeight: '600' }]}>
        {matches ? t('register.passwordsMatch') : t('register.passwordsNoMatch')}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: {
      marginTop: spacing.xs,
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    label: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
