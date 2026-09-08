import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppModal from './AppModal';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { usePayments, BankAccountInfo } from '../context/PaymentContext';
import { pickReceiptImage } from '../utils/avatarPicker';
import AppText from './AppText';

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
  const [bankInfo, setBankInfo] = useState<BankAccountInfo | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | undefined>(undefined);
  const [pickingReceipt, setPickingReceipt] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  const canManageAccount = user ? ['treasurer', 'admin', 'chairman'].includes(user.role) : false;

  useEffect(() => {
    if (!visible || !user) return;
    setLoading(true);
    getBankAccount(user.parkName, feeType).then((info) => {
      setBankInfo(info);
      setLoading(false);
    });
  }, [visible, user?.parkName, feeType]);

  useEffect(() => {
    if (!visible) {
      setReceiptUri(undefined);
      setReferenceNumber('');
      setError('');
    }
  }, [visible]);

  const handleCopy = async () => {
    if (!bankInfo) return;
    await Clipboard.setStringAsync(bankInfo.accountNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePickReceipt = async () => {
    setPickingReceipt(true);
    try {
      const result = await pickReceiptImage();
      if (result.status === 'success') {
        setReceiptUri(result.uri);
        setError('');
      } else if (result.status === 'permission-denied') {
        Alert.alert('', t('profile.avatarPermissionDenied'));
      }
    } finally {
      setPickingReceipt(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!user || !bankInfo) return;
    if (!receiptUri) {
      setError(t('paymentModal.receiptRequired'));
      return;
    }
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
      receiptUri,
      ...(referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
    });
    setConfirming(false);
    onRecorded();
  };

  const qrValue = bankInfo
    ? `Bank: ${bankInfo.bankName}\n${t('paymentModal.accountNumber')}: ${bankInfo.accountNumber}\n${t('paymentModal.accountHolder')}: ${bankInfo.accountHolder}\nRM${amount.toFixed(2)}\n${title}`
    : '';

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false}>
        <AppText style={typography.h3}>{title}</AppText>
        <AppText style={styles.amount}>RM {amount.toFixed(2)}</AppText>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : !bankInfo ? (
          <View style={styles.noAccountBox}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.textMuted} />
            <AppText style={styles.noAccountText}>{t('paymentModal.noAccountTitle')}</AppText>
            {canManageAccount && (
              <Button
                label={t('paymentModal.setupBank')}
                onPress={() => {
                  onClose();
                  navigation.navigate('BankAccountSettings', { feeType });
                }}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </View>
        ) : (
          <>
            <View style={styles.qrWrap}>
              {bankInfo.qrImageUri ? (
                <Image source={{ uri: bankInfo.qrImageUri }} style={styles.qrImage} resizeMode="contain" />
              ) : (
                <QRCode value={qrValue} size={150} color={colors.text} backgroundColor={colors.white} />
              )}
            </View>
            <AppText style={styles.qrHint}>
              {bankInfo.qrImageUri ? t('paymentModal.qrHintUploaded') : t('paymentModal.qrHint')}
            </AppText>

            <View style={styles.accountCard}>
              <View style={styles.accountRow}>
                <AppText style={styles.accountLabel}>{t('paymentModal.bank')}</AppText>
                <AppText style={styles.accountValue}>{bankInfo.bankName}</AppText>
              </View>
              <View style={styles.accountRow}>
                <AppText style={styles.accountLabel}>{t('paymentModal.accountNumber')}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText style={styles.accountValue}>{bankInfo.accountNumber}</AppText>
                  <TouchableOpacity onPress={handleCopy} hitSlop={8}>
                    <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.accountRow}>
                <AppText style={styles.accountLabel}>{t('paymentModal.accountHolder')}</AppText>
                <AppText style={[styles.accountValue, { flex: 1, textAlign: 'right' }]}>{bankInfo.accountHolder}</AppText>
              </View>
            </View>

            {copied && <AppText style={styles.copiedText}>{t('paymentModal.copied')}</AppText>}

            <AppText style={styles.note}>{t('paymentModal.note')}</AppText>

            <AppText style={styles.fieldLabel}>{t('paymentModal.receiptLabel')}</AppText>
            <TouchableOpacity
              style={styles.receiptPicker}
              activeOpacity={0.8}
              onPress={handlePickReceipt}
              disabled={pickingReceipt}
            >
              {receiptUri ? (
                <Image source={{ uri: receiptUri }} style={styles.receiptPreview} resizeMode="cover" />
              ) : (
                <View style={styles.receiptPlaceholder}>
                  <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                  <AppText style={styles.receiptPlaceholderText}>{t('paymentModal.addReceipt')}</AppText>
                </View>
              )}
              {receiptUri && (
                <View style={styles.receiptChangeBadge}>
                  <Ionicons name="camera" size={13} color={colors.white} />
                  <AppText style={styles.receiptChangeText}>{t('paymentModal.changeReceipt')}</AppText>
                </View>
              )}
            </TouchableOpacity>
            <AppText style={styles.receiptHint}>{t('paymentModal.receiptHint')}</AppText>

            <AppText style={styles.fieldLabel}>{t('paymentModal.referenceLabel')}</AppText>
            <TextInput
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder={t('paymentModal.referencePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.referenceInput}
            />

            {error ? <AppText style={styles.error}>{error}</AppText> : null}

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
      </ScrollView>
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
    qrImage: {
      width: 170,
      height: 170,
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
      textAlign: 'justify',
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    receiptPicker: {
      height: 130,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    receiptPreview: {
      width: '100%',
      height: '100%',
    },
    receiptPlaceholder: {
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
    receiptPlaceholderText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    receiptChangeBadge: {
      position: 'absolute',
      right: spacing.sm,
      bottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    receiptChangeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.white,
    },
    receiptHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    referenceInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 44,
      fontSize: 13,
      color: colors.text,
    },
    error: {
      color: colors.danger,
      fontSize: 12,
      marginTop: spacing.sm,
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
