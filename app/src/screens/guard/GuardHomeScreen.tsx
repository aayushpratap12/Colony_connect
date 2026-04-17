import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetVisitorsQuery } from '@redux/api/visitorsApi';
import useAppSelector from '@hooks/useAppSelector';
import type { RootState } from '@redux/store';
import type { GuardStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';
import Avatar from '@components/common/Avatar';

type Nav = NativeStackNavigationProp<GuardStackParamList>;

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  color: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, sublabel, color, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.qaRow} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.qaIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <View style={{ flex: 1, marginLeft: Spacing.md }}>
      <AppText variant="bodySmall" weight="semibold">{label}</AppText>
      <AppText variant="caption" color="textSecondary">{sublabel}</AppText>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
  </TouchableOpacity>
);

const GuardHomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector((s: RootState) => s.auth.user);

  const { data: enteredData }  = useGetVisitorsQuery({ status: 'entered' });
  const { data: pendingData }  = useGetVisitorsQuery({ status: 'pending' });
  const { data: todayData }    = useGetVisitorsQuery({ status: 'exited' });

  const activeVisitors = enteredData?.visitors.length ?? 0;
  const pendingApprovals = pendingData?.visitors.length ?? 0;
  const exitedToday = todayData?.visitors.length ?? 0;

  return (
    <ScreenWrapper scrollable padHorizontal={false}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySmall" color="textSecondary">Welcome back,</AppText>
          <AppText variant="h3" weight="bold">{user?.name?.split(' ')[0] ?? 'Guard'}</AppText>
        </View>
        <Avatar name={user?.name ?? 'G'} size="sm" role="guard" />
      </View>

      <View style={styles.content}>
        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>TODAY'S OVERVIEW</AppText>
        <View style={styles.statsRow}>
          <AppCard shadow="sm" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
            </View>
            <AppText variant="h3" weight="bold" style={{ marginTop: Spacing.xs }}>{activeVisitors}</AppText>
            <AppText variant="caption" color="textSecondary">Inside Now</AppText>
          </AppCard>
          <AppCard shadow="sm" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Ionicons name="time-outline" size={20} color={Colors.warning} />
            </View>
            <AppText variant="h3" weight="bold" style={{ marginTop: Spacing.xs }}>{pendingApprovals}</AppText>
            <AppText variant="caption" color="textSecondary">Pending</AppText>
          </AppCard>
          <AppCard shadow="sm" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
            </View>
            <AppText variant="h3" weight="bold" style={{ marginTop: Spacing.xs }}>{exitedToday}</AppText>
            <AppText variant="caption" color="textSecondary">Exited</AppText>
          </AppCard>
        </View>

        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>ACTIONS</AppText>
        <AppCard shadow="sm" style={{ paddingVertical: Spacing.xs }}>
          <QuickAction
            icon="keypad-outline"
            label="Verify OTP Entry"
            sublabel="Scan or enter visitor OTP"
            color={Colors.primary}
            onPress={() => navigation.navigate(Routes.VERIFY_OTP)}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="list-outline"
            label="Visitor Log"
            sublabel="View all visitor records"
            color={Colors.secondary}
            onPress={() => navigation.navigate(Routes.VISITOR_LOG)}
          />
        </AppCard>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  content: { padding: Spacing.lg },
  sectionLabel: { marginBottom: Spacing.sm, marginTop: Spacing.xs, letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'flex-start' },
  statIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  qaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  qaIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
});

export default GuardHomeScreen;
