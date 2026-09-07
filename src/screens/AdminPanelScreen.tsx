import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import { useAuth, User, Role } from '../context/AuthContext';
import AppText from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPanel'>;

const ROLE_OPTIONS: Role[] = ['resident', 'ajk', 'treasurer', 'chairman', 'admin'];

export default function AdminPanelScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, getParkUsers, setUserRole } = useAuth();
  const [residents, setResidents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const loadResidents = async () => {
    if (!user) return;
    setLoading(true);
    const list = await getParkUsers(user.parkName);
    setResidents(list.sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  };

  useEffect(() => {
    loadResidents();
  }, [user?.parkName]);

  const handleAssign = async (role: Role) => {
    if (!selected) return;
    setSaving(true);
    await setUserRole(selected.email, role);
    setSaving(false);
    setSelected(null);
    loadResidents();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={t('adminPanel.title')}
        subtitle={t('adminPanel.subtitle', { park: user?.parkName ?? '' })}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={residents}
        keyExtractor={(item) => item.email}
        refreshing={loading}
        onRefresh={loadResidents}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setSelected(item)}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <AppText style={typography.h3}>{item.name}</AppText>
              <AppText style={typography.caption}>{item.email}</AppText>
            </View>
            <View style={styles.roleBadge}>
              <AppText style={styles.roleBadgeText}>{t(`role.${item.role}`)}</AppText>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={28} color={colors.textMuted} />
              <AppText style={typography.caption}>{t('adminPanel.empty')}</AppText>
            </View>
          ) : null
        }
      />

      <AppModal visible={!!selected} onClose={() => setSelected(null)}>
        <AppText style={typography.h3}>{selected?.name}</AppText>
        <AppText style={[typography.caption, { marginTop: spacing.xs }]}>{t('adminPanel.pickRole')}</AppText>
        <View style={styles.chipRow}>
          {ROLE_OPTIONS.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.chip, selected?.role === role && styles.chipActive]}
              onPress={() => handleAssign(role)}
              disabled={saving}
            >
              <AppText style={[styles.chipText, selected?.role === role && styles.chipTextActive]}>
                {t(`role.${role}`)}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <Button label={t('common.close')} variant="ghost" onPress={() => setSelected(null)} style={{ marginTop: spacing.lg }} />
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withAlpha(colors.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleBadge: {
      backgroundColor: withAlpha(colors.primary, 0.1),
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    roleBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    chipTextActive: {
      color: colors.white,
    },
  });
