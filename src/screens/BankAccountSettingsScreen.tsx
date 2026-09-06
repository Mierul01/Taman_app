import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BankAccountSettings'>;

export default function BankAccountSettingsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getBankAccount, setBankAccount } = usePayments();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBankAccount(user.parkName).then((info) => {
      if (info) {
        setBankName(info.bankName);
        setAccountNumber(info.accountNumber);
        setAccountHolder(info.accountHolder);
      } else {
        setAccountHolder(`${t('bankAccount.defaultHolderPrefix')} ${user.parkName}`);
      }
      setLoading(false);
    });
  }, [user?.parkName]);

  const handleSave = async () => {
    if (!user || !bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return;
    setSaving(true);
    await setBankAccount(user.parkName, {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    });
    setSaving(false);
    navigation.goBack();
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={t('bankAccount.title')}
        subtitle={t('bankAccount.subtitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.fieldLabel}>{t('bankAccount.bankName')}</Text>
        <TextInput
          value={bankName}
          onChangeText={setBankName}
          placeholder={t('bankAccount.bankNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('paymentModal.accountNumber')}</Text>
        <TextInput
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder={t('bankAccount.accountNumberPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          keyboardType="number-pad"
        />

        <Text style={styles.fieldLabel}>{t('bankAccount.accountHolder')}</Text>
        <TextInput
          value={accountHolder}
          onChangeText={setAccountHolder}
          placeholder={t('bankAccount.accountHolderPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Button label={t('common.save')} onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
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
  });
