import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateAnnouncementMutation } from '@redux/api/announcementsApi';
import { Colors, Spacing } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';

const PostAnnouncementScreen = () => {
  const navigation = useNavigation();
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');

  const onSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Title and body are required');
      return;
    }
    try {
      await createAnnouncement({ title: title.trim(), body: body.trim() }).unwrap();
      Alert.alert('Posted!', 'Announcement sent to all residents.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to post announcement.');
    }
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Post Announcement</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppText variant="bodySmall" color="textSecondary" style={styles.hint}>
          Announcements are broadcast to all residents instantly.
        </AppText>

        <AppText variant="label" style={styles.label}>Title</AppText>
        <AppTextInput value={title} onChangeText={setTitle} placeholder="e.g. Water supply interruption tomorrow" maxLength={200} />

        <AppText variant="label" style={styles.label}>Message</AppText>
        <AppTextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your announcement here..."
          multiline
          numberOfLines={6}
          maxLength={2000}
          style={styles.textarea}
        />

        <AppButton title="Post Announcement" onPress={onSubmit} loading={isLoading} style={styles.btn} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  hint: { marginBottom: Spacing.lg, lineHeight: 20 },
  label: { marginBottom: Spacing.xs, marginTop: Spacing.md },
  textarea: { height: 140, textAlignVertical: 'top' },
  btn: { marginTop: Spacing.xl },
});

export default PostAnnouncementScreen;
