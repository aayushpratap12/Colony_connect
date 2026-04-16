import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetEventsQuery, useToggleRsvpMutation } from '@redux/api/eventsApi';
import type { Event } from '@typings/models.types';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppCard from '@components/common/AppCard';

type Nav = NativeStackNavigationProp<ResidentStackParamList>;

const EventCard = ({ item, onRsvp, onPress }: { item: Event; onRsvp: (id: string) => void; onPress: () => void }) => {
  const date = new Date(item.eventDate);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <AppCard shadow="sm" style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.datebox}>
            <AppText variant="h3" weight="bold" color="primary">{date.getDate()}</AppText>
            <AppText variant="caption" color="primary">{date.toLocaleString('en', { month: 'short' }).toUpperCase()}</AppText>
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <AppText variant="bodySmall" weight="semibold">{item.title}</AppText>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 2 }}>{item.venue}</AppText>
            </View>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 2 }}>
                {date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </AppText>
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: Spacing.sm }}>• {item.rsvpCount} going</AppText>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.rsvpBtn, item.userRsvped && styles.rsvpBtnActive]}
            onPress={() => onRsvp(item.id)}
          >
            <Ionicons name={item.userRsvped ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={item.userRsvped ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const ResidentEventsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, refetch } = useGetEventsQuery({ cursor, upcoming: true });
  const [toggleRsvp] = useToggleRsvpMutation();

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <AppText variant="h3" weight="bold">Events</AppText>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.events ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onRsvp={(id) => toggleRsvp(id)}
              onPress={() => navigation.navigate(Routes.EVENT_DETAIL, { eventId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListFooterComponent={isFetching && !isLoading ? () => <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.md }} /> : null}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No upcoming events</AppText>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { marginBottom: Spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  datebox: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  rsvpBtn: { padding: Spacing.xs },
  rsvpBtnActive: {},
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ResidentEventsScreen;
