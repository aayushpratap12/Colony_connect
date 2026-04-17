import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGetComplaintsQuery, useUpdateComplaintStatusMutation } from '@redux/api/complaintsApi';
import type { Complaint } from '@typings/models.types';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';

type StatusFilter = 'open' | 'in_progress' | 'resolved' | 'closed' | undefined;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'Open',        value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved',    value: 'resolved' },
  { label: 'All',         value: undefined },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: '#FEE2E2', text: '#DC2626' },
  in_progress: { bg: '#FEF3C7', text: '#D97706' },
  resolved:    { bg: '#D1FAE5', text: '#059669' },
  closed:      { bg: Colors.surfaceVariant, text: Colors.textSecondary },
};

const NEXT_STATUS: Record<string, { label: string; next: 'in_progress' | 'resolved' | 'closed' }> = {
  open:        { label: 'Mark In Progress', next: 'in_progress' },
  in_progress: { label: 'Mark Resolved',    next: 'resolved' },
  resolved:    { label: 'Close',            next: 'closed' },
};

const ComplaintCard = ({ item, onUpdateStatus }: { item: Complaint; onUpdateStatus: (id: string, status: string) => void }) => {
  const color = STATUS_COLORS[item.status] ?? STATUS_COLORS.closed;
  const next  = NEXT_STATUS[item.status];
  return (
    <AppCard shadow="sm" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.metaRow}>
          <AppText variant="caption" color="textSecondary" weight="medium">{item.category}</AppText>
          <AppText variant="caption" color="textDisabled"> · Flat {item.flatNumber}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
          <AppText variant="caption" weight="medium" style={{ color: color.text }}>
            {item.status.replace('_', ' ')}
          </AppText>
        </View>
      </View>
      <AppText variant="bodySmall" weight="semibold" style={{ marginTop: Spacing.xs }}>{item.title}</AppText>
      <AppText variant="caption" color="textSecondary" numberOfLines={2} style={{ marginTop: 2 }}>{item.description}</AppText>
      <AppText variant="caption" color="textDisabled" style={{ marginTop: Spacing.xs }}>
        {item.raisedByName} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </AppText>
      {next && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onUpdateStatus(item.id, next.next)}>
          <AppText variant="caption" color="primary" weight="medium">{next.label}</AppText>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </AppCard>
  );
};

const ManageComplaintsScreen = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<StatusFilter>('open');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, refetch } = useGetComplaintsQuery({ status, cursor });
  const [updateStatus] = useUpdateComplaintStatusMutation();

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);
  const onTabChange = (val: StatusFilter) => { setStatus(val); setCursor(undefined); };

  const onUpdateStatus = (id: string, next: string) => {
    Alert.alert('Update Status', `Mark as "${next.replace('_', ' ')}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await updateStatus({ id, status: next as any }).unwrap();
          } catch {
            Alert.alert('Error', 'Could not update complaint status.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Complaints</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity key={tab.label} style={[styles.tab, status === tab.value && styles.tabActive]} onPress={() => onTabChange(tab.value)}>
            <AppText variant="caption" weight="medium" style={{ color: status === tab.value ? Colors.primary : Colors.textSecondary }}>
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.complaints ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ComplaintCard item={item} onUpdateStatus={onUpdateStatus} />}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No complaints here</AppText>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ManageComplaintsScreen;
