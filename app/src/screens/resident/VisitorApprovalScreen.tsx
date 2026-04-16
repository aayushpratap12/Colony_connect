import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetVisitorsQuery,
  useCreateVisitorPassMutation,
  useApproveVisitorMutation,
} from '@redux/api/visitorsApi';
import type { Visitor } from '@typings/models.types';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';
import AppButton from '@components/common/AppButton';
import AppTextInput from '@components/common/AppTextInput';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#D97706' },
  approved: { bg: '#D1FAE5', text: '#059669' },
  entered:  { bg: Colors.primaryLight, text: Colors.primary },
  exited:   { bg: Colors.surfaceVariant, text: Colors.textSecondary },
  expired:  { bg: '#FEE2E2', text: '#DC2626' },
};

const VisitorCard = ({ item, onApprove }: { item: Visitor; onApprove: (id: string) => void }) => {
  const color = STATUS_COLORS[item.status] ?? STATUS_COLORS.expired;
  return (
    <AppCard shadow="sm" style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText variant="bodySmall" weight="semibold">{item.visitorName}</AppText>
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
          <AppText variant="caption" weight="medium" style={{ color: color.text }}>{item.status}</AppText>
        </View>
      </View>
      <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>{item.purpose}</AppText>
      {item.vehicleNumber && (
        <View style={styles.row}>
          <Ionicons name="car-outline" size={13} color={Colors.textSecondary} />
          <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>{item.vehicleNumber}</AppText>
        </View>
      )}
      {item.otp && item.status === 'pending' && (
        <View style={styles.otpBox}>
          <AppText variant="caption" color="textSecondary">OTP: </AppText>
          <AppText variant="bodySmall" weight="bold" color="primary">{item.otp}</AppText>
        </View>
      )}
      {item.entryTime && (
        <AppText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          Entry: {new Date(item.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      )}
      {item.status === 'pending' && (
        <AppButton title="Approve" onPress={() => onApprove(item.id)} variant="outline" style={styles.approveBtn} />
      )}
    </AppCard>
  );
};

const VisitorApprovalScreen = () => {
  const navigation = useNavigation();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose]         = useState('');
  const [vehicle, setVehicle]         = useState('');

  const { data, isLoading, isFetching, refetch } = useGetVisitorsQuery({ cursor });
  const [createPass, { isLoading: creating }] = useCreateVisitorPassMutation();
  const [approveVisitor] = useApproveVisitorMutation();

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);

  const onApprove = async (id: string) => {
    try {
      await approveVisitor(id).unwrap();
    } catch {
      Alert.alert('Error', 'Could not approve visitor');
    }
  };

  const onCreatePass = async () => {
    if (!visitorName.trim() || !purpose.trim()) {
      Alert.alert('Error', 'Visitor name and purpose are required');
      return;
    }
    try {
      const result = await createPass({ visitorName: visitorName.trim(), purpose: purpose.trim(), vehicleNumber: vehicle.trim() || undefined }).unwrap();
      setShowForm(false); setVisitorName(''); setPurpose(''); setVehicle('');
      Alert.alert('Pass Created', `Share OTP with visitor: ${result.otp}`);
    } catch {
      Alert.alert('Error', 'Could not create visitor pass');
    }
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Visitors</AppText>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <AppTextInput value={visitorName} onChangeText={setVisitorName} placeholder="Visitor name" style={styles.input} />
          <AppTextInput value={purpose} onChangeText={setPurpose} placeholder="Purpose of visit" style={styles.input} />
          <AppTextInput value={vehicle} onChangeText={setVehicle} placeholder="Vehicle number (optional)" style={styles.input} />
          <AppButton title="Generate OTP Pass" onPress={onCreatePass} loading={creating} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.visitors ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VisitorCard item={item} onApprove={onApprove} />}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No visitors yet</AppText>
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
  form: { backgroundColor: Colors.surface, padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  input: { marginBottom: 0 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  otpBox: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, backgroundColor: Colors.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm },
  approveBtn: { marginTop: Spacing.sm },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default VisitorApprovalScreen;
