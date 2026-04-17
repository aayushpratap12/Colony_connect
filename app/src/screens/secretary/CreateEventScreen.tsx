import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateEventMutation } from '@redux/api/eventsApi';
import { Colors, Spacing } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';

const pad = (n: number) => String(n).padStart(2, '0');

const formatDateForDisplay = (d: Date) =>
  `${d.getDate()} ${d.toLocaleString('en', { month: 'long' })} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue]           = useState('');
  const [dateStr, setDateStr]       = useState('');

  const onSubmit = async () => {
    if (!title.trim() || !description.trim() || !venue.trim() || !dateStr.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    // Parse date — accept formats: "DD/MM/YYYY HH:MM" or ISO
    let eventDate: Date;
    const parts = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
    if (parts) {
      const [, d, m, y, h, min] = parts;
      eventDate = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
    } else {
      eventDate = new Date(dateStr.trim());
    }

    if (isNaN(eventDate.getTime())) {
      Alert.alert('Invalid Date', 'Use format: DD/MM/YYYY HH:MM  e.g. 25/04/2025 18:00');
      return;
    }
    if (eventDate < new Date()) {
      Alert.alert('Invalid Date', 'Event date must be in the future');
      return;
    }

    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        eventDate: eventDate.toISOString(),
      }).unwrap();
      Alert.alert('Event Created!', 'Residents will be notified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create event.');
    }
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Create Event</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppText variant="label" style={styles.label}>Event Title</AppText>
        <AppTextInput value={title} onChangeText={setTitle} placeholder="e.g. Diwali Celebration" maxLength={200} />

        <AppText variant="label" style={styles.label}>Venue</AppText>
        <AppTextInput value={venue} onChangeText={setVenue} placeholder="e.g. Community Hall, Block B" maxLength={200} />

        <AppText variant="label" style={styles.label}>Date & Time</AppText>
        <AppTextInput
          value={dateStr}
          onChangeText={setDateStr}
          placeholder="DD/MM/YYYY HH:MM  e.g. 25/04/2025 18:00"
          maxLength={16}
        />

        <AppText variant="label" style={styles.label}>Description</AppText>
        <AppTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell residents what this event is about..."
          multiline
          numberOfLines={5}
          maxLength={2000}
          style={styles.textarea}
        />

        <AppButton title="Create Event" onPress={onSubmit} loading={isLoading} style={styles.btn} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  label: { marginBottom: Spacing.xs, marginTop: Spacing.md },
  textarea: { height: 120, textAlignVertical: 'top' },
  btn: { marginTop: Spacing.xl },
});

export default CreateEventScreen;
