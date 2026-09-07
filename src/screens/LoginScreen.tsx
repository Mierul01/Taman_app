import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('login.fillBoth'));
      return;
    }
    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);
    if (!result.success) {
      setError(t(result.messageKey ?? 'common.loginFailed'));
    }
  };

  return (
    <View style={styles.backdrop}>
      <Ionicons name="leaf" size={200} color="rgba(255,255,255,0.06)" style={styles.backdropWatermarkTop} />
      <Ionicons name="leaf" size={160} color="rgba(255,255,255,0.06)" style={styles.backdropWatermarkBottom} />

      <View style={styles.logoCircle}>
        <Ionicons name="leaf" size={28} color={colors.primary} />
      </View>

      <KeyboardAvoidingView
        style={styles.cardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <View style={styles.cardHandle} />
          <ScrollView contentContainerStyle={styles.cardContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle', { appName: t('common.appName') })}</Text>

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

            <TouchableOpacity style={styles.rememberRow} activeOpacity={0.75} onPress={() => setRememberMe((v) => !v)}>
              <Ionicons name={rememberMe ? 'checkbox' : 'square-outline'} size={19} color={colors.primary} />
              <Text style={styles.rememberText}>{t('login.rememberMe')}</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              label={t('login.submit')}
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t('login.noAccount')}</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                {t('login.registerLink')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.primary,
      overflow: 'hidden',
    },
    backdropWatermarkTop: {
      position: 'absolute',
      right: -50,
      top: -40,
    },
    backdropWatermarkBottom: {
      position: 'absolute',
      left: -40,
      bottom: -30,
    },
    logoCircle: {
      alignSelf: 'center',
      marginTop: 64,
      marginBottom: spacing.md,
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: withAlpha(colors.white, 0.35),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
    },
    cardWrap: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg * 1.7,
      marginHorizontal: spacing.md,
      ...shadow.card,
      overflow: 'hidden',
    },
    cardHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
    },
    cardContent: {
      padding: spacing.lg,
      paddingTop: spacing.md,
      flexGrow: 1,
    },
    title: {
      fontSize: 25,
      fontWeight: '800',
      letterSpacing: 0.2,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: spacing.xs,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
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
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.background,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.sm,
      height: 56,
      gap: spacing.sm,
    },
    inputIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: withAlpha(colors.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.lg,
    },
    rememberText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
    },
    submitButton: {
      marginTop: spacing.xl,
      borderRadius: radius.full,
      paddingVertical: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 4,
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
