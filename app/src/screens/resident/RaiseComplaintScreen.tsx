import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateComplaintMutation } from '@redux/api/complaintsApi';
import { Colors, Spacing } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import AppDropdown, { type DropdownOption } from '@components/common/AppDropdown';

const CATEGORIES = [
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Security',    value: 'security' },
  { label: 'Cleanliness', value: 'cleanliness' },
  { label: 'Other',       value: 'other' },
];

const RaiseComplaintScreen = () => {
  const navigation = useNavigation();
  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState('maintenance');

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await createComplaint({ title: title.trim(), description: description.trim(), category: category as any }).unwrap();
      Alert.alert('Success', 'Complaint submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    }
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Raise Complaint</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AppText variant="bodySmall" color="textSecondary" style={styles.hint}>
          Describe your issue clearly so the secretary can address it quickly.
        </AppText>

        <AppText variant="label" style={styles.label}>Category</AppText>
        <AppDropdown
          options={CATEGORIES}
          value={category}
          onChange={(opt: DropdownOption) => setCategory(String(opt.value))}
          placeholder="Select category"
        />

        <AppText variant="label" style={styles.label}>Title</AppText>
        <AppTextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Brief title of the issue"
          maxLength={200}
        />

        <AppText variant="label" style={styles.label}>Description</AppText>
        <AppTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the problem in detail..."
          multiline
          numberOfLines={5}
          maxLength={2000}
          style={styles.textarea}
        />

        <AppButton
          title="Submit Complaint"
          onPress={onSubmit}
          loading={isLoading}
          style={styles.submitBtn}
        />
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
  textarea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { marginTop: Spacing.xl },
});

export default RaiseComplaintScreen;
