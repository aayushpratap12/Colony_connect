import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetComplaintsQuery } from '@redux/api/complaintsApi';
import type { Complaint } from '@typings/models.types';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';

type Nav = NativeStackNavigationProp<ResidentStackParamList>;
type StatusFilter = 'open' | 'in_progress' | 'resolved' | 'closed' | undefined;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: '#FEE2E2', text: '#DC2626' },
  in_progress: { bg: '#FEF3C7', text: '#D97706' },
  resolved:    { bg: '#D1FAE5', text: '#059669' },
  closed:      { bg: Colors.surfaceVariant, text: Colors.textSecondary },
};

const ComplaintCard = ({ item }: { item: Complaint }) => {
  const color = STATUS_COLORS[item.status] ?? STATUS_COLORS.closed;
  return (
    <AppCard shadow="sm" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <AppText variant="caption" color="textSecondary" weight="medium">{item.category}</AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color.bg }]}>
          <AppText variant="caption" weight="medium" style={{ color: color.text }}>
            {item.status.replace('_', ' ')}
          </AppText>
        </View>
      </View>
      <AppText variant="bodySmall" weight="semibold" style={{ marginTop: Spacing.xs }}>{item.title}</AppText>
      <AppText variant="caption" color="textSecondary" numberOfLines={2} style={{ marginTop: 2 }}>{item.description}</AppText>
      <AppText variant="caption" color="textDisabled" style={{ marginTop: Spacing.xs }}>
        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </AppText>
    </AppCard>
  );
};

const ComplaintListScreen = () => {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState<StatusFilter>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, refetch } = useGetComplaintsQuery({ status, cursor });

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);
  const onTabChange = (val: StatusFilter) => { setStatus(val); setCursor(undefined); };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">My Complaints</AppText>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate(Routes.RAISE_COMPLAINT)}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
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
          renderItem={({ item }) => <ComplaintCard item={item} />}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListFooterComponent={isFetching && !isLoading ? () => <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.md }} /> : null}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="construct-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No complaints found</AppText>
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
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceVariant },
  tabActive: { backgroundColor: Colors.primaryLight },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm, backgroundColor: Colors.surfaceVariant },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ComplaintListScreen;
