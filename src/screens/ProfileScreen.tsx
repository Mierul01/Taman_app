import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { radius, shadow, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors, useThemeTypography } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import AppModal from '../components/AppModal';
import { useAuth, Role } from '../context/AuthContext';
import { pickAvatarImage } from '../utils/avatarPicker';

const RELATIONSHIPS = ['Isteri', 'Suami', 'Anak', 'Ibu', 'Bapa', 'Lain-lain'];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { t } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, logout, updateAvatar, addFamilyMember, removeFamilyMember, addFamilyMemberWithLogin } = useAuth();
  const navigation = useNavigation<any>();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [changingAvatar, setChangingAvatar] = useState(false);

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

  const [familyVisible, setFamilyVisible] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRelationship, setMemberRelationship] = useState(RELATIONSHIPS[0]);
  const [memberAge, setMemberAge] = useState('');
  const [createLogin, setCreateLogin] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const openAddFamily = () => {
    setMemberName('');
    setMemberRelationship(RELATIONSHIPS[0]);
    setMemberAge('');
    setCreateLogin(false);
    setMemberEmail('');
    setMemberPassword('');
    setMemberError('');
    setFamilyVisible(true);
  };

  const handleSaveMember = async () => {
    if (!memberName.trim()) return;
    if (createLogin && (!memberEmail.trim() || memberPassword.length < 6)) {
      setMemberError(t('profile.memberLoginError'));
      return;
    }
    setMemberError('');
    setSavingMember(true);
    const newMemberId = `fm_${Date.now()}`;
    const newMember = {
      id: newMemberId,
      name: memberName.trim(),
      relationship: memberRelationship,
      age: memberAge.trim() || undefined,
    };
    if (createLogin) {
      const result = await addFamilyMemberWithLogin(newMember, {
        email: memberEmail.trim(),
        password: memberPassword,
      });
      if (!result.success) {
        setMemberError(t(result.messageKey ?? 'profile.memberCreateFailed'));
        setSavingMember(false);
        return;
      }
    } else {
      await addFamilyMember(newMember);
    }
    setSavingMember(false);
    setFamilyVisible(false);
  };

  const infoRows = [
    { icon: 'mail-outline' as const, label: t('common.email'), value: user?.email },
    { icon: 'call-outline' as const, label: t('common.phone'), value: user?.phone },
    { icon: 'business-outline' as const, label: t('profile.park'), value: user?.parkName },
    { icon: 'home-outline' as const, label: t('common.address'), value: user?.address },
    {
      icon: 'location-outline' as const,
      label: t('profile.postcodeCity'),
      value: user ? `${user.postcode} ${user.city}` : '',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <ScreenHeader title={t('profile.title')} />

        <View style={styles.profileCard}>
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
                <Ionicons name="person" size={32} color={colors.white} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={13} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText} onPress={handleChangeAvatar}>
            {t('profile.changePhoto')}
          </Text>
          <Text style={[typography.h3, styles.nameText]} numberOfLines={2} ellipsizeMode="tail">
            {user?.name}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{t(`role.${user?.role ?? 'resident'}`)}</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => navigation.navigate('ProfileEdit')}>
              <Ionicons name="pencil" size={14} color={colors.primary} />
              <Text style={styles.editButtonText}>{t('profile.updateProfile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={14} color={colors.primary} />
              <Text style={styles.editButtonText}>{t('profile.settings')}</Text>
            </TouchableOpacity>
          </View>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.editButton, styles.adminButton]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AdminPanel')}
            >
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.white} />
              <Text style={[styles.editButtonText, { color: colors.white }]}>{t('profile.adminPanel')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          {infoRows.map((row, idx) => (
            <View key={row.label} style={[styles.infoRow, idx !== infoRows.length - 1 && styles.infoRowBorder]}>
              <Ionicons name={row.icon} size={18} color={colors.textMuted} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={typography.caption}>{row.label}</Text>
                <Text style={typography.body}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('profile.familyMembers')}</Text>
          <Text style={styles.linkText} onPress={openAddFamily}>
            {t('profile.addMember')}
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>{t('profile.familyHint')}</Text>

        {!user?.familyMembers?.length ? (
          <View style={styles.emptyFamily}>
            <Ionicons name="people-outline" size={26} color={colors.textMuted} />
            <Text style={styles.emptyFamilyText}>{t('profile.noFamily')}</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
            {user.familyMembers.map((member) => (
              <View key={member.id} style={styles.familyCard}>
                <View style={styles.familyAvatar}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={typography.h3}>{member.name}</Text>
                  <View style={styles.familyMetaRow}>
                    <View style={styles.relationshipBadge}>
                      <Text style={styles.relationshipBadgeText}>
                        {t(`relationship.${member.relationship}`)}
                      </Text>
                    </View>
                    {member.age ? (
                      <Text style={typography.caption}>{t('profile.yearsOld', { age: member.age })}</Text>
                    ) : null}
                    {member.linkedEmail ? (
                      <Ionicons name="link" size={12} color={colors.textMuted} />
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  activeOpacity={0.8}
                  onPress={() => removeFamilyMember(member.id)}
                >
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button label={t('profile.logOut')} variant="ghost" onPress={() => setConfirmLogout(true)} />
        </View>
      </ScrollView>

      <AppModal visible={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <Text style={[typography.h3, { textAlign: 'center' }]}>{t('profile.logOutConfirmTitle')}</Text>
        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs }]}>
          {t('profile.logOutConfirmBody')}
        </Text>
        <View style={styles.modalActions}>
          <Button label={t('common.cancel')} variant="ghost" onPress={() => setConfirmLogout(false)} style={{ flex: 1 }} />
          <Button
            label={t('profile.logOut')}
            variant="danger"
            onPress={() => {
              setConfirmLogout(false);
              logout();
            }}
            style={{ flex: 1 }}
          />
        </View>
      </AppModal>

      <AppModal visible={familyVisible} onClose={() => setFamilyVisible(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={typography.h3}>{t('profile.addFamilyTitle')}</Text>
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.fieldLabel}>{t('profile.memberName')}</Text>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder={t('profile.memberNamePlaceholder')}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldLabel}>{t('profile.relationship')}</Text>
            <View style={styles.chipRow}>
              {RELATIONSHIPS.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[styles.chip, memberRelationship === rel && styles.chipActive]}
                  onPress={() => setMemberRelationship(rel)}
                >
                  <Text style={[styles.chipText, memberRelationship === rel && styles.chipTextActive]}>
                    {t(`relationship.${rel}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>{t('profile.age')}</Text>
            <TextInput
              value={memberAge}
              onChangeText={setMemberAge}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={t('profile.agePlaceholder')}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={styles.toggleRow} onPress={() => setCreateLogin((v) => !v)}>
              <Ionicons name={createLogin ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} />
              <Text style={styles.toggleLabel}>{t('profile.createLoginToggle')}</Text>
            </TouchableOpacity>

            {createLogin && (
              <>
                <Text style={styles.toggleHint}>{t('profile.createLoginHint')}</Text>
                <Text style={styles.fieldLabel}>{t('profile.memberEmail')}</Text>
                <TextInput
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder={t('login.emailPlaceholder')}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.fieldLabel}>{t('profile.memberPassword')}</Text>
                <TextInput
                  value={memberPassword}
                  onChangeText={setMemberPassword}
                  secureTextEntry
                  placeholder={t('register.passwordPlaceholder')}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            {memberError ? <Text style={styles.errorText}>{memberError}</Text> : null}
          </View>
          <View style={styles.modalActions}>
            <Button label={t('common.cancel')} variant="ghost" onPress={() => setFamilyVisible(false)} style={{ flex: 1 }} />
            <Button
              label={t('common.save')}
              onPress={handleSaveMember}
              loading={savingMember}
              disabled={!memberName.trim()}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </AppModal>
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    profileCard: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    avatarWrap: {
      width: 76,
      height: 76,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
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
    nameText: {
      marginTop: spacing.sm,
      textAlign: 'center',
      maxWidth: '100%',
    },
    roleBadge: {
      marginTop: 4,
      backgroundColor: withAlpha(colors.primary, 0.1),
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    quickActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: withAlpha(colors.primary, 0.1),
    },
    adminButton: {
      backgroundColor: colors.primary,
      marginTop: spacing.sm,
    },
    editButtonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    infoCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    infoRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginHorizontal: spacing.lg,
      marginTop: 2,
      marginBottom: spacing.sm,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    emptyFamily: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.xs,
    },
    emptyFamilyText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    familyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.card,
    },
    familyAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withAlpha(colors.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    familyMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 4,
    },
    relationshipBadge: {
      backgroundColor: withAlpha(colors.accent, 0.15),
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    relationshipBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#95601C',
    },
    removeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: withAlpha(colors.danger, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    actions: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      marginTop: spacing.sm,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 46,
      fontSize: 14,
      color: colors.text,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
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
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    toggleLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
    },
    toggleHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
      lineHeight: 16,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: spacing.sm,
    },
  });
