import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGetVisitorsQuery, useMarkVisitorEntryMutation, useMarkVisitorExitMutation } from '@redux/api/visitorsApi';
import type { Visitor } from '@typings/models.types';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';

type StatusFilter = 'approved' | 'entered' | 'exited' | undefined;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'Approved', value: 'approved' },
  { label: 'Inside',   value: 'entered' },
  { label: 'Exited',   value: 'exited' },
  { label: 'All',      value: undefined },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#D97706' },
  approved: { bg: '#D1FAE5', text: '#059669' },
  entered:  { bg: '#DBEAFE', text: '#2563EB' },
  exited:   { bg: Colors.surfaceVariant, text: Colors.textSecondary },
  expired:  { bg: '#FEE2E2', text: '#DC2626' },
};

const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

interface VisitorCardProps {
  item: Visitor;
  onEntry: (id: string, name: string) => void;
  onExit: (id: string, name: string) => void;
}

const VisitorCard = ({ item, onEntry, onExit }: VisitorCardProps) => {
  const color = STATUS_STYLE[item.status] ?? STATUS_STYLE.expired;
  return (
    <AppCard shadow="sm" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySmall" weight="semibold">{item.visitorName}</AppText>
          <AppText variant="caption" color="textSecondary">Flat {item.flatNumber} · {item.residentName}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
          <AppText variant="caption" weight="medium" style={{ color: color.text }}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </AppText>
        </View>
      </View>

      <AppText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>{item.purpose}</AppText>

      {item.vehicleNumber && (
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={13} color={Colors.textSecondary} />
          <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>{item.vehicleNumber}</AppText>
        </View>
      )}

      <View style={styles.timesRow}>
        {item.entryTime && (
          <View style={styles.infoRow}>
            <Ionicons name="enter-outline" size={13} color={Colors.primary} />
            <AppText variant="caption" color="primary" style={{ marginLeft: 4 }}>In {formatTime(item.entryTime)}</AppText>
          </View>
        )}
        {item.exitTime && (
          <View style={[styles.infoRow, { marginLeft: Spacing.md }]}>
            <Ionicons name="exit-outline" size={13} color={Colors.textSecondary} />
            <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>Out {formatTime(item.exitTime)}</AppText>
          </View>
        )}
      </View>

      {item.status === 'approved' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEntry(item.id, item.visitorName)}>
          <Ionicons name="enter-outline" size={14} color={Colors.primary} />
          <AppText variant="caption" color="primary" weight="medium" style={{ marginLeft: 4 }}>Mark Entry</AppText>
        </TouchableOpacity>
      )}
      {item.status === 'entered' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onExit(item.id, item.visitorName)}>
          <Ionicons name="exit-outline" size={14} color={Colors.secondary} />
          <AppText variant="caption" weight="medium" style={{ marginLeft: 4, color: Colors.secondary }}>Mark Exit</AppText>
        </TouchableOpacity>
      )}
    </AppCard>
  );
};

const VisitorLogScreen = () => {
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, refetch } = useGetVisitorsQuery({ status: statusFilter, cursor });
  const [markEntry] = useMarkVisitorEntryMutation();
  const [markExit]  = useMarkVisitorExitMutation();

  const onTabChange = (val: StatusFilter) => { setStatusFilter(val); setCursor(undefined); };
  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);
  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onEntry = (id: string, name: string) => {
    Alert.alert('Mark Entry', `Allow ${name} to enter?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Allow', onPress: async () => {
        try { await markEntry(id).unwrap(); }
        catch { Alert.alert('Error', 'Could not mark entry.'); }
      }},
    ]);
  };

  const onExit = (id: string, name: string) => {
    Alert.alert('Mark Exit', `Mark ${name} as exited?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        try { await markExit(id).unwrap(); }
        catch { Alert.alert('Error', 'Could not mark exit.'); }
      }},
    ]);
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Visitor Log</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, statusFilter === tab.value && styles.tabActive]}
            onPress={() => onTabChange(tab.value)}
          >
            <AppText variant="caption" weight="medium" style={{ color: statusFilter === tab.value ? Colors.primary : Colors.textSecondary }}>
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.visitors ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VisitorCard item={item} onEntry={onEntry} onExit={onExit} />}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No visitors found</AppText>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceVariant },
  tabActive: { backgroundColor: Colors.primaryLight },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timesRow: { flexDirection: 'row', marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default VisitorLogScreen;
