import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentRecord } from '../context/PaymentContext';
import { toTitleCase } from '../utils/formatName';
import AppText from './AppText';

export default function PaymentRecordRow({
  record,
  showContributor,
  onPressReceipt,
}: {
  record: PaymentRecord;
  showContributor?: boolean;
  onPressReceipt: (uri: string) => void;
}) {
  const colors = useThemeColors();
  const { t, language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const dateLabel = new Date(record.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.thumbWrap}
        activeOpacity={0.8}
        onPress={() => record.receiptUri && onPressReceipt(record.receiptUri)}
        disabled={!record.receiptUri}
      >
        {record.receiptUri ? (
          <Image source={{ uri: record.receiptUri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbEmpty}>
            <Ionicons name="receipt-outline" size={16} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        {showContributor && (
          <AppText style={styles.contributor} numberOfLines={1}>
            {toTitleCase(record.userName)}
          </AppText>
        )}
        <AppText style={styles.meta} numberOfLines={1}>
          {dateLabel}
          {record.referenceNumber ? `  ·  ${t('paymentHistory.reference', { ref: record.referenceNumber })}` : ''}
        </AppText>
        {!record.receiptUri && <AppText style={styles.noReceipt}>{t('paymentHistory.noReceipt')}</AppText>}
      </View>
      <AppText style={styles.amount}>RM {record.amount.toFixed(2)}</AppText>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    thumbWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },
    thumb: {
      width: '100%',
      height: '100%',
    },
    thumbEmpty: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
    },
    contributor: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    meta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    noReceipt: {
      fontSize: 10.5,
      color: colors.danger,
      marginTop: 1,
    },
    amount: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginLeft: spacing.sm,
    },
  });
