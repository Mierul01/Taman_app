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
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthChecklist, { PasswordMatchIndicator } from '../components/PasswordStrengthChecklist';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parkName, setParkName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [showPdpaModal, setShowPdpaModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !parkName.trim() ||
      !address.trim() ||
      !postcode.trim() ||
      !city.trim() ||
      !password
    ) {
      setError(t('common.required'));
      return;
    }
    if (password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (!pdpaConsent) {
      setError(t('register.pdpaRequired'));
      return;
    }
    setLoading(true);
    const result = await register({
      name,
      email,
      phone,
      parkName: parkName.trim(),
      address,
      postcode,
      city,
      password,
    });
    setLoading(false);
    if (!result.success) {
      setError(t(result.messageKey ?? 'register.failed'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={typography.h1}>{t('register.title')}</Text>
        <Text style={[typography.body, styles.subtitle]}>
          {t('register.subtitle', { appName: t('common.appName') })}
        </Text>

        <View style={styles.form}>
          <Field label={t('register.fullName')} icon="person-outline" value={name} onChangeText={setName} placeholder={t('register.fullNamePlaceholder')} />
          <Field label={t('common.email')} icon="mail-outline" value={email} onChangeText={setEmail} placeholder={t('register.emailPlaceholder')} keyboardType="email-address" autoCapitalize="none" />
          <Field label={t('common.phone')} icon="call-outline" value={phone} onChangeText={setPhone} placeholder={t('register.phonePlaceholder')} keyboardType="phone-pad" />
          <Field
            label={t('register.parkName')}
            icon="business-outline"
            value={parkName}
            onChangeText={setParkName}
            placeholder={t('register.parkNamePlaceholder')}
          />
          <Text style={styles.parkHint}>{t('register.parkHint')}</Text>
          <Field
            label={t('common.address')}
            icon="home-outline"
            value={address}
            onChangeText={setAddress}
            placeholder={t('register.addressPlaceholder')}
            multiline
          />
          <View style={styles.row}>
            <Field
              label={t('common.postcode')}
              icon="location-outline"
              value={postcode}
              onChangeText={setPostcode}
              placeholder={t('register.postcodePlaceholder')}
              keyboardType="number-pad"
              maxLength={5}
              style={{ flex: 1 }}
            />
            <Field
              label={t('common.city')}
              icon="business-outline"
              value={city}
              onChangeText={setCity}
              placeholder={t('register.cityPlaceholder')}
              style={{ flex: 2 }}
            />
          </View>
          <Field label={t('register.password')} icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder={t('register.passwordPlaceholder')} secureTextEntry />
          <PasswordStrengthChecklist password={password} />
          <Field label={t('register.confirmPassword')} icon="lock-closed-outline" value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t('register.confirmPasswordPlaceholder')} secureTextEntry />
          <PasswordMatchIndicator password={password} confirmPassword={confirmPassword} />

          <TouchableOpacity style={styles.pdpaRow} activeOpacity={0.75} onPress={() => setPdpaConsent((v) => !v)}>
            <Ionicons
              name={pdpaConsent ? 'checkbox' : 'square-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.pdpaText}>
              {t('register.pdpaConsent')}{' '}
              <Text style={styles.pdpaLink} onPress={() => setShowPdpaModal(true)}>
                {t('register.pdpaReadMore')}
              </Text>
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label={t('register.submit')} onPress={handleRegister} loading={loading} style={{ marginTop: spacing.md }} />

          <View style={styles.footerRow}>
            <Text style={typography.caption}>{t('register.haveAccount')}</Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              {t('register.loginLink')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <AppModal visible={showPdpaModal} onClose={() => setShowPdpaModal(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={typography.h3}>{t('register.pdpaModalTitle')}</Text>
          <Text style={styles.pdpaModalBody}>{t('register.pdpaModalBody')}</Text>
          <Button
            label={t('common.close')}
            onPress={() => setShowPdpaModal(false)}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </AppModal>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  style,
  multiline,
  secureTextEntry,
  ...inputProps
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  maxLength?: number;
  multiline?: boolean;
  style?: ViewStyle;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} style={multiline ? styles.multilineIcon : undefined} />
        <TextInput
          {...inputProps}
          secureTextEntry={secureTextEntry && !visible}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {secureTextEntry && (
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={colors.textMuted}
            onPress={() => setVisible((v) => !v)}
          />
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: 64,
      paddingBottom: spacing.xl,
    },
    subtitle: {
      marginTop: spacing.xs,
      color: colors.textMuted,
    },
    form: {
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    parkHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 15,
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
      paddingHorizontal: spacing.md,
      height: 50,
      gap: spacing.sm,
    },
    inputWrapMultiline: {
      alignItems: 'flex-start',
      height: undefined,
      minHeight: 50,
      paddingVertical: spacing.sm,
    },
    multilineIcon: {
      marginTop: 2,
    },
    inputMultiline: {
      minHeight: 30,
      paddingTop: 0,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    pdpaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    pdpaText: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
    },
    pdpaLink: {
      color: colors.primary,
      fontWeight: '700',
    },
    pdpaModalBody: {
      marginTop: spacing.sm,
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
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
    },
    link: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
  });
