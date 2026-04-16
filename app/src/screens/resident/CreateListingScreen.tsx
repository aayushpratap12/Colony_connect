import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateListingMutation } from '@redux/api/marketplaceApi';
import { Colors, Spacing } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import AppDropdown, { type DropdownOption } from '@components/common/AppDropdown';

const CATEGORIES = [
  { label: 'Electronics',  value: 'electronics' },
  { label: 'Furniture',    value: 'furniture' },
  { label: 'Clothing',     value: 'clothing' },
  { label: 'Books',        value: 'books' },
  { label: 'Kitchen',      value: 'kitchen' },
  { label: 'Sports',       value: 'sports' },
  { label: 'Other',        value: 'other' },
];

const CreateListingScreen = () => {
  const navigation = useNavigation();
  const [createListing, { isLoading }] = useCreateListingMutation();

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]           = useState('');
  const [category, setCategory]     = useState('other');

  const onSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Error', 'Enter a valid price');
      return;
    }
    try {
      await createListing({ title: title.trim(), description: description.trim(), price: parsedPrice, category }).unwrap();
      Alert.alert('Success', 'Listing posted!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    }
  };

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Post a Listing</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AppText variant="label" style={styles.label}>Category</AppText>
        <AppDropdown
          options={CATEGORIES}
          value={category}
          onChange={(opt: DropdownOption) => setCategory(String(opt.value))}
          placeholder="Select category"
        />

        <AppText variant="label" style={styles.label}>Title</AppText>
        <AppTextInput value={title} onChangeText={setTitle} placeholder="What are you selling?" maxLength={200} />

        <AppText variant="label" style={styles.label}>Price (₹)</AppText>
        <AppTextInput value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" maxLength={10} />

        <AppText variant="label" style={styles.label}>Description</AppText>
        <AppTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the item, condition, etc."
          multiline
          numberOfLines={5}
          maxLength={2000}
          style={styles.textarea}
        />

        <AppButton title="Post Listing" onPress={onSubmit} loading={isLoading} style={styles.submitBtn} />
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
  submitBtn: { marginTop: Spacing.xl },
});

export default CreateListingScreen;
