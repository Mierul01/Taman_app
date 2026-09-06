import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppModal from './AppModal';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../context/PaymentContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRecorded: () => void;
  feeId: string;
  title: string;
  feeType: 'yuran' | 'khairat';
  amount: number;
};

export default function PaymentDetailsModal({
  visible,
  onClose,
  onRecorded,
  feeId,
  title,
  feeType,
  amount,
}: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { getBankAccount, addPaymentRecord } = usePayments();
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState<{ bankName: string; accountNumber: string; accountHolder: string } | null>(
    null
  );
  const [confirming, setConfirming] = useState(false);

  const canManageAccount = user ? ['treasurer', 'admin', 'chairman'].includes(user.role) : false;

  useEffect(() => {
    if (!visible || !user) return;
    setLoading(true);
    getBankAccount(user.parkName).then((info) => {
      setBankInfo(info);
      setLoading(false);
    });
  }, [visible, user?.parkName]);

  const handleCopy = async () => {
    if (!bankInfo) return;
    await Clipboard.setStringAsync(bankInfo.accountNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPaid = async () => {
    if (!user || !bankInfo) return;
    setConfirming(true);
    await addPaymentRecord({
      userEmail: user.email,
      userName: user.name,
      parkName: user.parkName,
      feeId,
      feeTitle: title,
      feeType,
      amount,
      date: new Date().toISOString(),
    });
    setConfirming(false);
    onRecorded();
  };

  const qrValue = bankInfo
    ? `Bank: ${bankInfo.bankName}\n${t('paymentModal.accountNumber')}: ${bankInfo.accountNumber}\n${t('paymentModal.accountHolder')}: ${bankInfo.accountHolder}\nRM${amount.toFixed(2)}\n${title}`
    : '';

  return (
    <AppModal visible={visible} onClose={onClose}>
      <Text style={typography.h3}>{title}</Text>
      <Text style={styles.amount}>RM {amount.toFixed(2)}</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : !bankInfo ? (
        <View style={styles.noAccountBox}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.textMuted} />
          <Text style={styles.noAccountText}>{t('paymentModal.noAccountTitle')}</Text>
          {canManageAccount && (
            <Button
              label={t('paymentModal.setupBank')}
              onPress={() => {
                onClose();
                navigation.navigate('BankAccountSettings');
              }}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </View>
      ) : (
        <>
          <View style={styles.qrWrap}>
            <QRCode value={qrValue} size={150} color={colors.text} backgroundColor={colors.white} />
          </View>
          <Text style={styles.qrHint}>{t('paymentModal.qrHint')}</Text>

          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>{t('paymentModal.bank')}</Text>
              <Text style={styles.accountValue}>{bankInfo.bankName}</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>{t('paymentModal.accountNumber')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.accountValue}>{bankInfo.accountNumber}</Text>
                <TouchableOpacity onPress={handleCopy} hitSlop={8}>
                  <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>{t('paymentModal.accountHolder')}</Text>
              <Text style={[styles.accountValue, { flex: 1, textAlign: 'right' }]}>{bankInfo.accountHolder}</Text>
            </View>
          </View>

          {copied && <Text style={styles.copiedText}>{t('paymentModal.copied')}</Text>}

          <Text style={styles.note}>{t('paymentModal.note')}</Text>

          <View style={styles.modalActions}>
            <Button label={t('common.cancel')} variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label={t('paymentModal.confirmPaid')}
              onPress={handleConfirmPaid}
              loading={confirming}
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}
    </AppModal>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    amount: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 4,
    },
    qrWrap: {
      alignSelf: 'center',
      padding: spacing.sm,
      backgroundColor: colors.white,
      borderRadius: radius.md,
      marginTop: spacing.md,
    },
    qrHint: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    accountCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    accountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    accountLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    accountValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    copiedText: {
      textAlign: 'center',
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    note: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: spacing.md,
      lineHeight: 18,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    noAccountBox: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    noAccountText: {
      textAlign: 'center',
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },
  });
