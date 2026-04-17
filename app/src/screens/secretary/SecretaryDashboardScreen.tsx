import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetComplaintsQuery } from '@redux/api/complaintsApi';
import { useGetAnnouncementsQuery } from '@redux/api/announcementsApi';
import { useGetEventsQuery } from '@redux/api/eventsApi';
import { useGetResidentsQuery } from '@redux/api/residentsApi';
import useAppSelector from '@hooks/useAppSelector';
import type { RootState } from '@redux/store';
import type { SecretaryStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';
import Avatar from '@components/common/Avatar';

type Nav = NativeStackNavigationProp<SecretaryStackParamList>;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <AppCard shadow="sm" style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <AppText variant="h3" weight="bold" style={{ marginTop: Spacing.sm }}>{value}</AppText>
    <AppText variant="caption" color="textSecondary">{label}</AppText>
  </AppCard>
);

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, color, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.qaIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <AppText variant="caption" weight="medium" center style={{ marginTop: Spacing.xs }}>{label}</AppText>
  </TouchableOpacity>
);

const SecretaryDashboardScreen = () => {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector((s: RootState) => s.auth.user);

  const { data: complaintsData } = useGetComplaintsQuery({ status: 'open' });
  const { data: residentsData }  = useGetResidentsQuery({ role: 'resident' });
  const { data: eventsData }     = useGetEventsQuery({ upcoming: true, limit: 1 });
  const { data: announcementsData } = useGetAnnouncementsQuery({});

  const openComplaints  = complaintsData?.complaints.length ?? 0;
  const totalResidents  = residentsData?.length ?? 0;
  const upcomingEvents  = eventsData?.events.length ?? 0;
  const announcements   = announcementsData?.announcements.length ?? 0;

  return (
    <ScreenWrapper scrollable padHorizontal={false}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySmall" color="textSecondary">Welcome back,</AppText>
          <AppText variant="h3" weight="bold">{user?.name?.split(' ')[0] ?? 'Secretary'}</AppText>
        </View>
        <Avatar name={user?.name ?? 'S'} size="sm" role="secretary" />
      </View>

      <View style={styles.content}>
        {/* Stats grid */}
        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>OVERVIEW</AppText>
        <View style={styles.statsGrid}>
          <StatCard label="Open Complaints" value={openComplaints} icon="construct-outline"  color={Colors.warning} />
          <StatCard label="Residents"        value={totalResidents} icon="people-outline"     color={Colors.primary} />
          <StatCard label="Upcoming Events"  value={upcomingEvents} icon="calendar-outline"   color={Colors.secondary} />
          <StatCard label="Announcements"    value={announcements}  icon="megaphone-outline"  color={Colors.success} />
        </View>

        {/* Quick actions */}
        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>QUICK ACTIONS</AppText>
        <AppCard shadow="sm" style={styles.qaCard}>
          <View style={styles.qaGrid}>
            <QuickAction icon="megaphone-outline"  label="Announce"    color={Colors.primary}   onPress={() => navigation.navigate(Routes.POST_ANNOUNCEMENT)} />
            <QuickAction icon="construct-outline"  label="Complaints"  color={Colors.warning}   onPress={() => navigation.navigate(Routes.MANAGE_COMPLAINTS)} />
            <QuickAction icon="calendar-outline"   label="Event"       color={Colors.secondary} onPress={() => navigation.navigate(Routes.CREATE_EVENT)} />
            <QuickAction icon="people-outline"     label="Residents"   color={Colors.success}   onPress={() => navigation.navigate(Routes.MANAGE_RESIDENTS)} />
          </View>
        </AppCard>

        {/* Open complaints preview */}
        {openComplaints > 0 && (
          <>
            <View style={styles.sectionRow}>
              <AppText variant="label" color="textSecondary">OPEN COMPLAINTS</AppText>
              <TouchableOpacity onPress={() => navigation.navigate(Routes.MANAGE_COMPLAINTS)}>
                <AppText variant="caption" color="primary" weight="medium">See all</AppText>
              </TouchableOpacity>
            </View>
            <AppCard shadow="sm" style={{ paddingVertical: Spacing.sm }}>
              {(complaintsData?.complaints ?? []).slice(0, 3).map((c, i) => (
                <View key={c.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.complaintRow}>
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodySmall" weight="medium" numberOfLines={1}>{c.title}</AppText>
                      <AppText variant="caption" color="textSecondary">Flat {c.flatNumber} · {c.category}</AppText>
                    </View>
                  </View>
                </View>
              ))}
            </AppCard>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  content: { padding: Spacing.lg },
  sectionLabel: { marginBottom: Spacing.sm, letterSpacing: 0.5 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '47.5%', alignItems: 'flex-start' },
  statIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  qaCard: { marginBottom: Spacing.lg },
  qaGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  quickAction: { alignItems: 'center', paddingVertical: Spacing.sm, width: '22%' },
  qaIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  complaintRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning, marginRight: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight },
});

export default SecretaryDashboardScreen;
