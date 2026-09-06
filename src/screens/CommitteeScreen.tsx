import React, { useCallback, useMemo, useState } from 'react';
import { Linking, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import AppModal from '../components/AppModal';
import { emergencyContacts } from '../data/mockData';
import { useAuth, User } from '../context/AuthContext';

type ListEntry =
  | { kind: 'member'; id: string; name: string; roleLabel: string; phone: string }
  | { kind: 'emergency'; id: string; name: string; roleLabel: string; phone: string };

export default function CommitteeScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, getParkUsers } = useAuth();
  const [committee, setCommittee] = useState<User[]>([]);
  const [selected, setSelected] = useState<ListEntry | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const parkUsers = await getParkUsers(user.parkName);
    setCommittee(parkUsers.filter((u) => u.role !== 'resident').sort((a, b) => a.name.localeCompare(b.name)));
  }, [user?.parkName]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sections = [
    {
      title: t('committee.committeeSection'),
      isCommittee: true,
      data: committee.map(
        (m): ListEntry => ({ kind: 'member', id: m.email, name: m.name, roleLabel: t(`role.${m.role}`), phone: m.phone })
      ),
    },
    {
      title: t('committee.emergencySection'),
      isCommittee: false,
      data: emergencyContacts.map(
        (c): ListEntry => ({
          kind: 'emergency',
          id: c.id,
          name: t(`emergencyContact.${c.id}Name`),
          roleLabel: t(`emergencyContact.${c.id}Role`),
          phone: c.phone,
        })
      ),
    },
  ];

  const callNumber = (phone: string) => Linking.openURL(`tel:${phone}`);
  const whatsappNumber = (phone: string) => {
    const digits = phone.replace(/[^0-9]/g, '');
    const withCountryCode = digits.startsWith('0') ? `6${digits}` : digits;
    Linking.openURL(`https://wa.me/${withCountryCode}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('committee.title')} subtitle={t('committee.subtitle', { park: user?.parkName ?? '' })} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setSelected(item)}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: item.kind === 'emergency' ? colors.danger : colors.primary },
              ]}
            >
              <Ionicons name={item.kind === 'emergency' ? 'alert' : 'person'} size={18} color={colors.white} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={typography.h3}>{item.name}</Text>
              <Text style={typography.caption}>{item.roleLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        renderSectionFooter={({ section }) =>
          section.isCommittee && committee.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={26} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('committee.empty')}</Text>
            </View>
          ) : null
        }
      />

      <AppModal visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <View style={[styles.modalAvatar, { backgroundColor: selected.kind === 'emergency' ? colors.danger : colors.primary }]}>
              <Ionicons name={selected.kind === 'emergency' ? 'alert' : 'person'} size={26} color={colors.white} />
            </View>
            <Text style={[typography.h3, { textAlign: 'center', marginTop: spacing.md }]}>{selected.name}</Text>
            <Text style={[typography.caption, { textAlign: 'center' }]}>{selected.roleLabel}</Text>
            <Text style={styles.phoneText}>{selected.phone}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => callNumber(selected.phone)}>
                <View style={[styles.actionIcon, { backgroundColor: withAlpha(colors.primary, 0.12) }]}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{t('committee.call')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => whatsappNumber(selected.phone)}>
                <View style={[styles.actionIcon, { backgroundColor: withAlpha('#25D366', 0.15) }]}>
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </View>
                <Text style={styles.actionLabel}>{t('committee.whatsapp')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`sms:${selected.phone}`)}>
                <View style={[styles.actionIcon, { backgroundColor: withAlpha(colors.accent, 0.15) }]}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={colors.accent} />
                </View>
                <Text style={styles.actionLabel}>{t('committee.sms')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    sectionHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadow.card,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    modalAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    phoneText: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.lg,
    },
    actionButton: {
      alignItems: 'center',
      gap: 6,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
  });
