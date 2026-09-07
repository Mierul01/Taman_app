import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import SelectField from '../components/SelectField';
import { useAuth } from '../context/AuthContext';
import { pickAvatarImage } from '../utils/avatarPicker';
import PasswordStrengthChecklist, { PasswordMatchIndicator } from '../components/PasswordStrengthChecklist';
import { SELANGOR_CITIES, SELANGOR_DISTRICTS, SelangorDistrict } from '../data/selangorLocations';
import { MALAYSIA_STATE_OPTIONS } from '../data/malaysiaLocations';
import AppText from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEdit'>;

export default function ProfileEditScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, updateProfile, updateAvatar, changePassword } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [postcode, setPostcode] = useState(user?.postcode ?? '');
  const [state, setState] = useState(user?.state || 'Selangor');
  const [district, setDistrict] = useState<SelangorDistrict | ''>((user?.district as SelangorDistrict) ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [saving, setSaving] = useState(false);
  const [changingAvatar, setChangingAvatar] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError(t('register.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('register.passwordMismatch'));
      return;
    }
    setPasswordError('');
    setSavingPassword(true);
    await changePassword(newPassword);
    setSavingPassword(false);
    setNewPassword('');
    setConfirmNewPassword('');
    Alert.alert('', t('profileEdit.passwordUpdated'));
  };

  const handleChangeAvatar = async () => {
    setChangingAvatar(true);
    try {
      const result = await pickAvatarImage();
      if (result.status === 'success') {
        await updateAvatar(result.uri);
      } else if (result.status === 'permission-denied') {
        Alert.alert('', t('profile.avatarPermissionDenied'));
      }
    } finally {
      setChangingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      postcode: postcode.trim(),
      state,
      district,
      city,
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title={t('profileEdit.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={handleChangeAvatar}
            disabled={changingAvatar}
          >
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={30} color={colors.white} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <AppText style={styles.changePhotoText} onPress={handleChangeAvatar}>
            {t('profile.changePhoto')}
          </AppText>
        </View>

        <AppText style={styles.fieldLabel}>{t('profileEdit.fullName')}</AppText>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.textMuted} />

        <AppText style={styles.fieldLabel}>{t('common.phone')}</AppText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        <AppText style={styles.fieldLabel}>{t('common.address')}</AppText>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={[styles.input, styles.inputMultiline]}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.fieldLabel}>{t('common.postcode')}</AppText>
            <TextInput
              value={postcode}
              onChangeText={setPostcode}
              keyboardType="number-pad"
              maxLength={5}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <SelectField
            label={t('common.state')}
            icon="flag-outline"
            value={state}
            options={MALAYSIA_STATE_OPTIONS}
            placeholder={t('register.statePlaceholder')}
            onSelect={setState}
            style={{ flex: 2 }}
          />
        </View>

        <SelectField
          label={t('common.district')}
          icon="map-outline"
          value={district}
          options={SELANGOR_DISTRICTS as unknown as string[]}
          placeholder={t('register.districtPlaceholder')}
          onSelect={(value) => setDistrict(value as SelangorDistrict)}
        />

        <SelectField
          label={t('common.city')}
          icon="business-outline"
          value={city}
          options={SELANGOR_CITIES}
          placeholder={t('register.cityPlaceholder')}
          onSelect={setCity}
        />

        <View style={styles.infoBox}>
          <AppText style={styles.infoText}>
            {t('profileEdit.infoBox', { park: user?.parkName ?? '', role: t(`role.${user?.role ?? 'resident'}`) })}
          </AppText>
        </View>

        <Button label={t('common.save')} onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />

        <View style={styles.passwordSection}>
          <AppText style={styles.sectionTitle}>{t('profileEdit.changePasswordTitle')}</AppText>

          <AppText style={styles.fieldLabel}>{t('profileEdit.newPassword')}</AppText>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder={t('profileEdit.newPasswordPlaceholder')}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <PasswordStrengthChecklist password={newPassword} />

          <AppText style={styles.fieldLabel}>{t('profileEdit.confirmNewPassword')}</AppText>
          <TextInput
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            placeholder={t('profileEdit.confirmNewPasswordPlaceholder')}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <PasswordMatchIndicator password={newPassword} confirmPassword={confirmNewPassword} />

          {passwordError ? <AppText style={styles.errorText}>{passwordError}</AppText> : null}

          <Button
            label={t('profileEdit.updatePassword')}
            variant="secondary"
            onPress={handleUpdatePassword}
            loading={savingPassword}
            disabled={!newPassword || !confirmNewPassword}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    avatarSection: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarWrap: {
      width: 72,
      height: 72,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    changePhotoText: {
      marginTop: spacing.sm,
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
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
    inputMultiline: {
      height: undefined,
      minHeight: 48,
      paddingVertical: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    infoBox: {
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
    },
    infoText: {
      fontSize: 12,
      color: colors.primaryDark,
      lineHeight: 17,
    },
    passwordSection: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: spacing.sm,
    },
  });
