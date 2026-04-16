import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@hooks/useAppSelector';
import { useLogoutUserMutation } from '@redux/api/authApi';
import { Colors, Spacing, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import Avatar from '@components/common/Avatar';

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuRow = ({ icon, label, onPress, danger }: MenuRowProps) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
    </View>
    <AppText variant="bodySmall" style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</AppText>
    {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textDisabled} />}
  </TouchableOpacity>
);

const ResidentProfileScreen = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logoutUser(),
      },
    ]);
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <AppText variant="h3" weight="bold">Profile</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <Avatar name={user?.name ?? 'R'} size="lg" role="resident" />
          <AppText variant="h3" weight="bold" style={{ marginTop: Spacing.md }}>{user?.name}</AppText>
          <AppText variant="bodySmall" color="textSecondary">{user?.phone}</AppText>
          <View style={styles.badgeRow}>
            {user?.flatNumber && (
              <View style={styles.badge}>
                <Ionicons name="home-outline" size={13} color={Colors.primary} />
                <AppText variant="caption" color="primary" weight="medium" style={{ marginLeft: 4 }}>Flat {user.flatNumber}</AppText>
              </View>
            )}
            <View style={[styles.badge, styles.roleBadge]}>
              <AppText variant="caption" weight="medium" style={{ color: Colors.residentColor }}>Resident</AppText>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>ACCOUNT</AppText>
          <View style={styles.menuCard}>
            <MenuRow icon="person-outline"      label="Edit Profile"         onPress={() => {}} />
            <View style={styles.divider} />
            <MenuRow icon="notifications-outline" label="Notification Settings" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuRow icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>SUPPORT</AppText>
          <View style={styles.menuCard}>
            <MenuRow icon="help-circle-outline" label="Help & FAQ"       onPress={() => {}} />
            <View style={styles.divider} />
            <MenuRow icon="chatbubble-outline"  label="Contact Support"  onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow icon="log-out-outline" label={isLoading ? 'Logging out...' : 'Logout'} onPress={onLogout} danger />
          </View>
        </View>

        <AppText variant="caption" color="textDisabled" center style={styles.version}>
          Colony Connect v1.0.0
        </AppText>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  content: { paddingBottom: Spacing.xxl },
  profileCard: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  roleBadge: { backgroundColor: '#EDE9FE' },
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionLabel: { marginBottom: Spacing.sm, letterSpacing: 0.5 },
  menuCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuIconDanger: { backgroundColor: '#FEE2E2' },
  menuLabel: { flex: 1 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.lg + 36 + Spacing.md },
  version: { marginTop: Spacing.xl },
});

export default ResidentProfileScreen;
