import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetEventQuery, useToggleRsvpMutation } from '@redux/api/eventsApi';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppButton from '@components/common/AppButton';

type Props = NativeStackScreenProps<ResidentStackParamList, typeof Routes.EVENT_DETAIL>;

const EventDetailScreen = ({ route, navigation }: Props) => {
  const { eventId } = route.params;
  const { data: event, isLoading } = useGetEventQuery(eventId);
  const [toggleRsvp, { isLoading: rsvping }] = useToggleRsvpMutation();

  const onRsvp = async () => {
    try {
      await toggleRsvp(eventId).unwrap();
    } catch {
      Alert.alert('Error', 'Could not update RSVP');
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenWrapper>
    );
  }

  if (!event) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}><AppText color="textSecondary">Event not found</AppText></View>
      </ScreenWrapper>
    );
  }

  const date = new Date(event.eventDate);

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Event Details</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateBanner}>
          <View style={styles.datebox}>
            <AppText variant="h2" weight="bold" style={{ color: Colors.textInverse }}>{date.getDate()}</AppText>
            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {date.toLocaleString('en', { month: 'long' }).toUpperCase()}
            </AppText>
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.lg }}>
            <AppText variant="h3" weight="bold" style={{ color: Colors.textInverse }}>{event.title}</AppText>
            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              by {event.createdByName}
            </AppText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <View style={{ marginLeft: Spacing.md }}>
              <AppText variant="caption" color="textSecondary">Venue</AppText>
              <AppText variant="bodySmall" weight="medium">{event.venue}</AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <View style={{ marginLeft: Spacing.md }}>
              <AppText variant="caption" color="textSecondary">Time</AppText>
              <AppText variant="bodySmall" weight="medium">
                {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={Colors.primary} />
            <View style={{ marginLeft: Spacing.md }}>
              <AppText variant="caption" color="textSecondary">Attendees</AppText>
              <AppText variant="bodySmall" weight="medium">{event.rsvpCount} going</AppText>
            </View>
          </View>
        </View>

        <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>ABOUT</AppText>
        <AppText variant="body" style={styles.description}>{event.description}</AppText>

        <AppButton
          title={event.userRsvped ? "Cancel RSVP" : "RSVP — I'm Going!"}
          onPress={onRsvp}
          loading={rsvping}
          variant={event.userRsvped ? 'outline' : 'primary'}
          style={styles.rsvpBtn}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  dateBanner: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.md },
  datebox: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  infoCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  sectionLabel: { marginBottom: Spacing.sm, letterSpacing: 0.5 },
  description: { lineHeight: 24, color: Colors.textSecondary, marginBottom: Spacing.xl },
  rsvpBtn: { marginBottom: Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default EventDetailScreen;
