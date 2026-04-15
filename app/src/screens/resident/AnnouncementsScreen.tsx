import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetAnnouncementsQuery } from '@redux/api/announcementsApi';
import type { Announcement } from '@typings/models.types';
import { Colors, Spacing, Radius, Shadow, FontSize } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';

// ─── Announcement Card ────────────────────────────────────────────────────────
interface AnnouncementCardProps {
  item: Announcement;
}

const AnnouncementCard = ({ item }: AnnouncementCardProps) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <AppCard shadow="sm" style={styles.card}>
      {item.isPinned && (
        <View style={styles.pinnedRow}>
          <MaterialCommunityIcons name="pin" size={14} color={Colors.primary} />
          <AppText variant="caption" color="primary" weight="medium" style={{ marginLeft: 4 }}>
            Pinned
          </AppText>
        </View>
      )}
      <AppText variant="bodySmall" weight="semibold" style={styles.title}>
        {item.title}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" style={styles.body}>
        {item.body}
      </AppText>
      <View style={styles.footer}>
        <View style={styles.authorRow}>
          <MaterialCommunityIcons name="account-outline" size={14} color={Colors.textSecondary} />
          <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
            {item.createdByName}
          </AppText>
        </View>
        <View style={styles.timeRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
          <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
            {timeAgo(item.createdAt)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

// ─── AnnouncementsScreen ──────────────────────────────────────────────────────
const AnnouncementsScreen = () => {
  const navigation = useNavigation();
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, refetch } = useGetAnnouncementsQuery({ cursor });

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => {
    setCursor(undefined);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padHorizontal={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Announcements</AppText>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={data?.announcements ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListFooterComponent={
          isFetching && !isLoading
            ? () => <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
            : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <MaterialCommunityIcons name="bullhorn-outline" size={48} color={Colors.textDisabled} />
            <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>
              No announcements yet
            </AppText>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    marginBottom: Spacing.xs,
    lineHeight: FontSize.md * 1.4,
  },
  body: {
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  loader: {
    marginVertical: Spacing.md,
  },
});

export default AnnouncementsScreen;
