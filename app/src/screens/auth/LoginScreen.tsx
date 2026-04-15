import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontWeight } from '@constants/theme';
import { AppText, AppTextInput, AppButton, ScreenWrapper } from '@components/common';
import { useSendOtpMutation } from '@redux/api/authApi';
import type { AuthStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const validate = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;
    try {
      await sendOtp({ phone: `+91${phone.replace(/\D/g, '')}` }).unwrap();
      navigation.navigate(Routes.OTP_VERIFY, { phone: `+91${phone.replace(/\D/g, '')}` });
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setError(message ?? 'Failed to send OTP. Try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding scrollable>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <AppText style={styles.logoText}>CC</AppText>
        </View>
        <AppText variant="h2" weight="bold" style={styles.title}>Welcome back</AppText>
        <AppText variant="body" color="textSecondary" center>
          Enter your mobile number to continue
        </AppText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <AppTextInput
          label="Mobile Number"
          required
          placeholder="98765 43210"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
          error={error}
          leftIcon={
            <View style={styles.countryCode}>
              <AppText variant="body" weight="medium">🇮🇳 +91</AppText>
            </View>
          }
        />

        <AppButton
          title="Send OTP"
          onPress={handleSendOtp}
          loading={isLoading}
          fullWidth
          size="lg"
          style={styles.btn}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <AppText variant="caption" color="textSecondary" center>
          By continuing, you agree to our{' '}
        </AppText>
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <AppText variant="caption" color="primary">Terms of Service</AppText>
          </TouchableOpacity>
          <AppText variant="caption" color="textSecondary"> & </AppText>
          <TouchableOpacity>
            <AppText variant="caption" color="primary">Privacy Policy</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoText:    { fontSize: 28, color: Colors.textInverse, fontWeight: FontWeight.bold },
  title:       { marginBottom: 0 },
  form:        { gap: Spacing.lg, paddingTop: Spacing.md },
  countryCode: {
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    marginRight: Spacing.sm,
  },
  btn:         { marginTop: Spacing.sm },
  footer:      { alignItems: 'center', paddingTop: Spacing.xl, gap: 2 },
  footerLinks: { flexDirection: 'row', alignItems: 'center' },
});

export default LoginScreen;
