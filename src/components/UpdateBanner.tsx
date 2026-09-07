import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadow, spacing, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { checkForUpdate, UpdateInfo } from '../utils/checkForUpdate';
import AppText from './AppText';

const DISMISSED_KEY = '@tlamana_update_dismissed_version';

export default function UpdateBanner() {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [info, setInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      const result = await checkForUpdate();
      if (!result.available) return;
      const dismissedVersion = await AsyncStorage.getItem(DISMISSED_KEY);
      if (dismissedVersion === result.latestVersion) return;
      setInfo(result);
    })();
  }, []);

  if (!info?.available) return null;

  const dismiss = async () => {
    if (info.latestVersion) {
      await AsyncStorage.setItem(DISMISSED_KEY, info.latestVersion);
    }
    setInfo(null);
  };

  const download = () => {
    if (info.downloadUrl) Linking.openURL(info.downloadUrl);
  };

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 78 }]} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="cloud-download-outline" size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppText style={styles.title}>{t('update.available', { version: info.latestVersion ?? '' })}</AppText>
          <AppText style={styles.subtitle}>{t('update.subtitle')}</AppText>
        </View>
        <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={dismiss} hitSlop={8}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85} onPress={download}>
        <AppText style={styles.downloadButtonText}>{t('update.download')}</AppText>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
      zIndex: 1000,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    closeButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadButton: {
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
      paddingVertical: 10,
      alignItems: 'center',
    },
    downloadButtonText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 13,
    },
  });
