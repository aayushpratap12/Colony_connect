import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootState } from '@redux/store';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { useGetAnnouncementsQuery } from '@redux/api/announcementsApi';
import type { Announcement } from '@typings/models.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';
import Avatar from '@components/common/Avatar';

type Nav = NativeStackNavigationProp<ResidentStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  iconColor: string;
  onPress: () => void;
}

// ─── QuickAction ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, bg, iconColor, onPress }: QuickActionProps) => (
  <TouchableOpacity
    style={[styles.quickAction, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={icon} size={26} color={iconColor} />
    <AppText variant="caption" weight="medium" style={{ color: iconColor, marginTop: 4, textAlign: 'center' }}>
      {label}
    </AppText>
  </TouchableOpacity>
);

// ─── AnnouncementItem ─────────────────────────────────────────────────────────
const timeAgo = (dateStr: string) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
};

const AnnouncementItem = ({ item }: { item: Announcement }) => (
  <View style={styles.announcementRow}>
    <View style={[styles.announcementDot, item.isPinned && styles.pinnedDot]} />
    <View style={{ flex: 1 }}>
      <AppText variant="bodySmall" weight="medium" numberOfLines={1}>{item.title}</AppText>
      <View style={styles.announcementMeta}>
        {item.isPinned && (
          <MaterialCommunityIcons name="pin" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
        )}
        <AppText variant="caption" color="textSecondary">{timeAgo(item.createdAt)}</AppText>
      </View>
    </View>
  </View>
);

// ─── ResidentHomeScreen ───────────────────────────────────────────────────────
const ResidentHomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const user = useSelector((s: RootState) => s.auth.user);

  const { data: announcementsData } = useGetAnnouncementsQuery({});

  const firstName = user?.name?.split(' ')[0] ?? 'Resident';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const previewAnnouncements = announcementsData?.announcements.slice(0, 3) ?? [];

  return (
    <ScreenWrapper scrollable padHorizontal={false}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySmall" color="textSecondary">{greeting},</AppText>
          <AppText variant="h3" weight="bold">{firstName}</AppText>
          {user?.flatNumber && (
            <View style={styles.flatBadge}>
              <Ionicons name="home-outline" size={12} color={Colors.primary} />
              <AppText variant="caption" color="primary" weight="medium" style={{ marginLeft: 3 }}>
                Flat {user.flatNumber}
              </AppText>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: Spacing.sm }}>
          <Avatar name={user?.name ?? 'R'} size="sm" role="resident" />
        </View>
      </View>

      <View style={styles.content}>
        {/* ── SOS Banner ── */}
        <TouchableOpacity
          style={styles.sosBanner}
          onPress={() => navigation.navigate(Routes.SOS)}
          activeOpacity={0.85}
        >
          <View style={styles.sosLeft}>
            <Ionicons name="warning-outline" size={22} color={Colors.textInverse} />
            <View style={{ marginLeft: Spacing.sm }}>
              <AppText variant="label" style={styles.sosTitle}>Emergency SOS</AppText>
              <AppText variant="caption" style={styles.sosSubtitle}>
                Tap to alert security & neighbours
              </AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* ── Quick Actions ── */}
        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
          QUICK ACTIONS
        </AppText>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="megaphone-outline"
            label="Announcements"
            bg={Colors.primaryLight}
            iconColor={Colors.primary}
            onPress={() => navigation.navigate(Routes.ANNOUNCEMENTS)}
          />
          <QuickAction
            icon="construct-outline"
            label="Complaint"
            bg="#FEF3C7"
            iconColor="#D97706"
            onPress={() => navigation.navigate(Routes.RAISE_COMPLAINT)}
          />
          <QuickAction
            icon="car-outline"
            label="Visitor"
            bg="#D1FAE5"
            iconColor="#059669"
            onPress={() => navigation.navigate(Routes.VISITOR_APPROVAL)}
          />
          <QuickAction
            icon="hardware-chip-outline"
            label="AI Assistant"
            bg="#EDE9FE"
            iconColor={Colors.secondary}
            onPress={() => navigation.navigate(Routes.AI_ASSISTANT)}
          />
        </View>

        {/* ── Announcements ── */}
        <View style={styles.sectionHeader}>
          <AppText variant="label" color="textSecondary">ANNOUNCEMENTS</AppText>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate(Routes.ANNOUNCEMENTS)}
          >
            <AppText variant="caption" color="primary" weight="medium">See all</AppText>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <AppCard shadow="sm" style={styles.card}>
          {previewAnnouncements.length === 0 ? (
            <AppText variant="bodySmall" color="textSecondary" center style={{ paddingVertical: Spacing.md }}>
              No announcements yet
            </AppText>
          ) : (
            previewAnnouncements.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={styles.divider} />}
                <AnnouncementItem item={item} />
              </View>
            ))
          )}
        </AppCard>

        {/* ── Upcoming Event ── */}
        <View style={styles.sectionHeader}>
          <AppText variant="label" color="textSecondary">UPCOMING EVENT</AppText>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate(Routes.RESIDENT_EVENTS as any)}
          >
            <AppText variant="caption" color="primary" weight="medium">See all</AppText>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <AppCard shadow="sm" style={styles.card}>
          <View style={styles.eventRow}>
            <View style={styles.eventDateBox}>
              <AppText variant="h3" weight="bold" color="primary">20</AppText>
              <AppText variant="caption" color="primary">APR</AppText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <AppText variant="bodySmall" weight="semibold">Holi Celebration</AppText>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                <AppText variant="caption" color="textSecondary" style={{ marginLeft: 2 }}>
                  Community Garden
                </AppText>
                <Ionicons name="time-outline" size={12} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                <AppText variant="caption" color="textSecondary" style={{ marginLeft: 2 }}>
                  6:00 PM
                </AppText>
              </View>
              <View style={[styles.tag, styles.eventTag]}>
                <AppText variant="caption" style={{ color: '#D97706' }}>Festival</AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* ── Community Chat ── */}
        <AppCard
          shadow="md"
          onPress={() => navigation.navigate(Routes.RESIDENT_CHAT as any)}
          style={styles.chatCard}
        >
          <View style={styles.chatRow}>
            <View style={styles.chatIconBox}>
              <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <AppText variant="bodySmall" weight="semibold">Community Chat</AppText>
              <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                Stay connected with neighbours
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </View>
        </AppCard>
      </View>
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  flatBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sosBanner: {
    backgroundColor: Colors.sosRed,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosTitle: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  sosSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  quickAction: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  announcementDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginTop: 5,
    marginRight: Spacing.sm,
  },
  pinnedDot: {
    backgroundColor: Colors.accent,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventTag: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  chatCard: {
    marginBottom: Spacing.xl,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResidentHomeScreen;
