import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLazyVerifyVisitorOtpQuery, useMarkVisitorEntryMutation } from '@redux/api/visitorsApi';
import type { Visitor } from '@typings/models.types';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import AppCard from '@components/common/AppCard';

const StatusBadge = ({ status }: { status: Visitor['status'] }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending:  { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
    approved: { bg: '#D1FAE5', text: '#059669', label: 'Approved' },
    entered:  { bg: '#DBEAFE', text: '#2563EB', label: 'Inside' },
    exited:   { bg: Colors.surfaceVariant, text: Colors.textSecondary, label: 'Exited' },
    expired:  { bg: '#FEE2E2', text: '#DC2626', label: 'Expired' },
  };
  const c = map[status] ?? map.expired;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <AppText variant="caption" weight="medium" style={{ color: c.text }}>{c.label}</AppText>
    </View>
  );
};

const VerifyOtpScreen = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [visitor, setVisitor] = useState<Visitor | null>(null);

  const [verifyOtp, { isFetching }] = useLazyVerifyVisitorOtpQuery();
  const [markEntry, { isLoading: isMarking }] = useMarkVisitorEntryMutation();

  const onVerify = async () => {
    const trimmed = otp.trim();
    if (trimmed.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
      return;
    }
    try {
      const result = await verifyOtp(trimmed).unwrap();
      setVisitor(result);
    } catch {
      Alert.alert('Not Found', 'No visitor found with this OTP or it has expired.');
      setVisitor(null);
    }
  };

  const onMarkEntry = async () => {
    if (!visitor) return;
    if (visitor.status === 'entered') {
      Alert.alert('Already Inside', 'This visitor has already entered.');
      return;
    }
    if (visitor.status !== 'approved') {
      Alert.alert('Not Approved', 'This visitor pass has not been approved by the resident yet.');
      return;
    }
    try {
      await markEntry(visitor.id).unwrap();
      Alert.alert('Entry Marked', `${visitor.visitorName} has been allowed entry.`, [
        { text: 'OK', onPress: () => { setOtp(''); setVisitor(null); } },
      ]);
    } catch {
      Alert.alert('Error', 'Could not mark entry. Please try again.');
    }
  };

  const canMarkEntry = visitor?.status === 'approved';

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Verify OTP</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppText variant="bodySmall" color="textSecondary" style={styles.hint}>
          Enter the 6-digit OTP provided by the visitor to verify their pass.
        </AppText>

        <AppText variant="label" style={styles.label}>Visitor OTP</AppText>
        <AppTextInput
          value={otp}
          onChangeText={(t) => { setOtp(t.replace(/\D/g, '').slice(0, 6)); setVisitor(null); }}
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
        />

        <AppButton
          title="Verify"
          onPress={onVerify}
          loading={isFetching}
          style={styles.verifyBtn}
          disabled={otp.trim().length !== 6}
        />

        {isFetching && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}

        {visitor && (
          <AppCard shadow="sm" style={styles.visitorCard}>
            <View style={styles.cardHeader}>
              <AppText variant="bodySmall" weight="bold">{visitor.visitorName}</AppText>
              <StatusBadge status={visitor.status} />
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={14} color={Colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
                Flat {visitor.flatNumber} · {visitor.residentName}
              </AppText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>{visitor.purpose}</AppText>
            </View>

            {visitor.vehicleNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={14} color={Colors.textSecondary} />
                <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>{visitor.vehicleNumber}</AppText>
              </View>
            )}

            {visitor.entryTime && (
              <View style={styles.infoRow}>
                <Ionicons name="enter-outline" size={14} color={Colors.primary} />
                <AppText variant="caption" color="primary" style={{ marginLeft: 4 }}>
                  Entered: {new Date(visitor.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </AppText>
              </View>
            )}

            {canMarkEntry && (
              <AppButton
                title="Allow Entry"
                onPress={onMarkEntry}
                loading={isMarking}
                style={styles.entryBtn}
              />
            )}

            {!canMarkEntry && visitor.status !== 'entered' && (
              <View style={styles.warningRow}>
                <Ionicons name="warning-outline" size={14} color={Colors.warning} />
                <AppText variant="caption" style={{ color: Colors.warning, marginLeft: 4 }}>
                  {visitor.status === 'pending' ? 'Awaiting resident approval' : `Status: ${visitor.status}`}
                </AppText>
              </View>
            )}
          </AppCard>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  hint: { marginBottom: Spacing.lg, lineHeight: 20 },
  label: { marginBottom: Spacing.xs },
  verifyBtn: { marginTop: Spacing.md },
  centered: { marginTop: Spacing.md, alignItems: 'center' },
  visitorCard: { marginTop: Spacing.xl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  warningRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  entryBtn: { marginTop: Spacing.md },
});

export default VerifyOtpScreen;
