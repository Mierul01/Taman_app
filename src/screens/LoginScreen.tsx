import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('login.fillBoth'));
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(t(result.messageKey ?? 'common.loginFailed'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBlock}>
          <Ionicons name="leaf" size={150} color="rgba(255,255,255,0.08)" style={styles.headerWatermark} />
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle', { appName: t('common.appName') })}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>{t('common.email')}</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <Text style={styles.fieldLabel}>{t('login.passwordLabel')}</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.textMuted}
              onPress={() => setShowPassword((v) => !v)}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label={t('login.submit')} onPress={handleLogin} loading={loading} style={{ marginTop: spacing.lg }} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('login.noAccount')}</Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
              {t('login.registerLink')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    headerBlock: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: radius.lg * 1.4,
      borderBottomRightRadius: radius.lg * 1.4,
      overflow: 'hidden',
      alignItems: 'center',
      paddingTop: 72,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    headerWatermark: {
      position: 'absolute',
      right: -24,
      top: -24,
    },
    logoCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      ...shadow.card,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.white,
    },
    subtitle: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.primaryLight,
      textAlign: 'center',
    },
    form: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      height: 54,
      gap: spacing.sm,
    },
    inputIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: withAlpha(colors.primary, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    error: {
      color: colors.danger,
      marginTop: spacing.md,
      fontSize: 13,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.lg,
      gap: 4,
    },
    footerText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    link: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
  });
