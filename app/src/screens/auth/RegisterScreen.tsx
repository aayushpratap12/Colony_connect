import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Spacing, FontSize } from '@constants/theme';
import {
  AppText, AppTextInput, AppButton, AppDropdown,
  ScreenWrapper, Avatar,
} from '@components/common';
import { useRegisterMutation } from '@redux/api/authApi';
import type { AuthStackParamList, AuthScreenProps } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import type { DropdownOption } from '@components/common';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const ROLE_OPTIONS: DropdownOption[] = [
  { label: 'Resident',  value: 'resident' },
  { label: 'Secretary', value: 'secretary' },
  { label: 'Guard',     value: 'guard' },
];

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<AuthScreenProps<typeof Routes.REGISTER>['route']>();
  const { phone, colonyId } = params;

  const [name, setName]           = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [role, setRole]           = useState<string>('resident');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [register, { isLoading }] = useRegisterMutation();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())       e.name = 'Name is required';
    if (!flatNumber.trim()) e.flatNumber = 'Flat / unit number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        phone,
        colonyId,
        name: name.trim(),
        flatNumber: flatNumber.trim(),
      }).unwrap();
      // RTK Query onQueryStarted dispatches setCredentials → RootNavigator switches automatically
    } catch (err: any) {
      Alert.alert('Registration failed', err?.data?.message ?? 'Something went wrong. Try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding scrollable>
      <AppButton
        title="‹ Back"
        variant="ghost"
        size="sm"
        onPress={() => navigation.goBack()}
        style={styles.back}
      />

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" weight="bold">Create Profile</AppText>
        <AppText variant="body" color="textSecondary">
          Almost done! Tell us about yourself.
        </AppText>
      </View>

      {/* Avatar picker */}
      <View style={styles.avatarWrapper}>
        <Avatar uri={avatarUri} name={name} size="xl" />
        <AppButton
          title={avatarUri ? 'Change Photo' : 'Add Photo'}
          variant="outline"
          size="sm"
          onPress={handlePickAvatar}
          style={styles.avatarBtn}
        />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <AppTextInput
          label="Full Name"
          required
          placeholder="e.g. Aayush Kumar"
          value={name}
          onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
          error={errors.name}
          autoCapitalize="words"
        />

        <AppTextInput
          label="Flat / Unit Number"
          required
          placeholder="e.g. A-204, B-12, Villa 3"
          value={flatNumber}
          onChangeText={(t) => { setFlatNumber(t); setErrors((e) => ({ ...e, flatNumber: '' })); }}
          error={errors.flatNumber}
          autoCapitalize="characters"
        />

        <AppDropdown
          label="I am a"
          required
          options={ROLE_OPTIONS}
          value={role}
          onChange={(opt) => setRole(String(opt.value))}
        />

        {/* Phone (read-only) */}
        <AppTextInput
          label="Mobile Number"
          value={phone}
          editable={false}
          leftIcon={<AppText style={styles.flag}>🇮🇳</AppText>}
        />
      </View>

      {/* Submit */}
      <AppButton
        title="Join Colony"
        onPress={handleRegister}
        loading={isLoading}
        fullWidth
        size="lg"
        style={styles.submitBtn}
      />

      <AppText variant="caption" color="textSecondary" center style={styles.note}>
        Your secretary will verify your membership.
      </AppText>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  back:          { alignSelf: 'flex-start', marginTop: Spacing.sm },
  header:        { gap: Spacing.xs, paddingVertical: Spacing.md },
  avatarWrapper: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
  avatarBtn:     { minWidth: 120 },
  form:          { gap: Spacing.lg },
  flag:          { fontSize: FontSize.lg, marginRight: Spacing.xs },
  submitBtn:     { marginTop: Spacing.xl },
  note:          { marginTop: Spacing.md, paddingBottom: Spacing.lg },
});

export default RegisterScreen;
