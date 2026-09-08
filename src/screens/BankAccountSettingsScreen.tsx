import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import BankSelectModal from '../components/BankSelectModal';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';
import { PaymentMethodGroup } from '../data/paymentMethods';
import { pickQrImage } from '../utils/avatarPicker';
import AppText from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'BankAccountSettings'>;

export default function BankAccountSettingsScreen({ navigation, route }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getBankAccount, setBankAccount } = usePayments();
  const feeType = route.params.feeType;
  const [bankName, setBankName] = useState('');
  const [methodGroup, setMethodGroup] = useState<PaymentMethodGroup>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [qrImageUri, setQrImageUri] = useState<string | undefined>(undefined);
  const [pickingQr, setPickingQr] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setBankName('');
    setMethodGroup('bank');
    setAccountNumber('');
    setQrImageUri(undefined);
    getBankAccount(user.parkName, feeType).then((info) => {
      if (info) {
        setBankName(info.bankName);
        setMethodGroup(info.methodGroup ?? 'bank');
        setAccountNumber(info.accountNumber);
        setAccountHolder(info.accountHolder);
        setQrImageUri(info.qrImageUri);
      } else {
        setAccountHolder(
          feeType === 'khairat'
            ? t('bankAccount.defaultHolderPrefixKhairat')
            : `${t('bankAccount.defaultHolderPrefix')} ${user.parkName}`
        );
      }
      setLoading(false);
    });
  }, [user?.parkName, feeType]);

  const handlePickQr = async () => {
    setPickingQr(true);
    try {
      const result = await pickQrImage();
      if (result.status === 'success') {
        setQrImageUri(result.uri);
      } else if (result.status === 'permission-denied') {
        Alert.alert('', t('profile.avatarPermissionDenied'));
      }
    } finally {
      setPickingQr(false);
    }
  };

  const handleSave = async () => {
    if (!user || !bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return;
    setSaving(true);
    await setBankAccount(user.parkName, feeType, {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      methodGroup,
      ...(qrImageUri ? { qrImageUri } : {}),
    });
    setSaving(false);
    navigation.goBack();
  };

  const isEwallet = methodGroup === 'ewallet';

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={feeType === 'khairat' ? t('bankAccount.titleKhairat') : t('bankAccount.titleYuran')}
        subtitle={feeType === 'khairat' ? t('bankAccount.subtitleKhairat') : t('bankAccount.subtitleYuran')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <AppText style={styles.fieldLabel}>{t('bankAccount.bankName')}</AppText>
        <TouchableOpacity style={styles.selectInput} activeOpacity={0.8} onPress={() => setPickerVisible(true)}>
          <AppText style={bankName ? styles.selectValue : styles.selectPlaceholder}>
            {bankName || t('bankAccount.bankNamePlaceholder')}
          </AppText>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <AppText style={styles.fieldLabel}>
          {isEwallet ? t('bankAccount.accountNumberLabelEwallet') : t('paymentModal.accountNumber')}
        </AppText>
        <TextInput
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder={
            isEwallet ? t('bankAccount.accountNumberPlaceholderEwallet') : t('bankAccount.accountNumberPlaceholder')
          }
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          keyboardType={isEwallet ? 'phone-pad' : 'number-pad'}
        />

        <AppText style={styles.fieldLabel}>{t('bankAccount.accountHolder')}</AppText>
        <TextInput
          value={accountHolder}
          onChangeText={setAccountHolder}
          placeholder={t('bankAccount.accountHolderPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>{t('bankAccount.qrLabel')}</AppText>
        <TouchableOpacity style={styles.qrPicker} activeOpacity={0.8} onPress={handlePickQr} disabled={pickingQr}>
          {qrImageUri ? (
            <Image source={{ uri: qrImageUri }} style={styles.qrPreview} resizeMode="contain" />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={26} color={colors.primary} />
              <AppText style={styles.qrPlaceholderText}>{t('bankAccount.addQr')}</AppText>
            </View>
          )}
          {qrImageUri && (
            <View style={styles.qrChangeBadge}>
              <Ionicons name="camera" size={13} color={colors.white} />
              <AppText style={styles.qrChangeText}>{t('bankAccount.changeQr')}</AppText>
            </View>
          )}
        </TouchableOpacity>
        <AppText style={styles.qrHint}>{t('bankAccount.qrHint')}</AppText>

        <Button label={t('common.save')} onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>

      <BankSelectModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(label, group) => {
          setBankName(label);
          setMethodGroup(group);
          setPickerVisible(false);
        }}
      />
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
    selectInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 48,
    },
    selectValue: {
      fontSize: 14,
      color: colors.text,
    },
    selectPlaceholder: {
      fontSize: 14,
      color: colors.textMuted,
    },
    qrPicker: {
      width: 180,
      height: 180,
      alignSelf: 'center',
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    qrPreview: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.white,
    },
    qrPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: withAlpha(colors.primary, 0.08),
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: radius.md,
    },
    qrPlaceholderText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
      paddingHorizontal: spacing.sm,
    },
    qrChangeBadge: {
      position: 'absolute',
      right: spacing.sm,
      bottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    qrChangeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.white,
    },
    qrHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });
