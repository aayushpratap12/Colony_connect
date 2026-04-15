import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing } from '@constants/theme';
import { AppText, AppButton, OtpInput, ScreenWrapper } from '@components/common';
import { useVerifyOtpMutation, useSendOtpMutation } from '@redux/api/authApi';
import type { AuthStackParamList, AuthScreenProps } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Config } from '@constants/config';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const OtpVerifyScreen = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<AuthScreenProps<typeof Routes.OTP_VERIFY>['route']>();
  const { phone } = params;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState<number>(Config.OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) { setError('Enter the 6-digit OTP'); return; }
    setError('');
    try {
      const res = await verifyOtp({ phone, otp }).unwrap();
      const { isNewUser } = res.data;
      if (isNewUser) {
        navigation.navigate(Routes.COLONY_SELECT, { phone });
      }
      // If existing user → RTK Query onQueryStarted dispatches setCredentials → RootNavigator switches automatically
    } catch (err: any) {
      setError(err?.data?.message ?? 'Invalid OTP. Please try again.');
      setOtp('');
    }
  }, [otp, phone, verifyOtp, navigation]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) handleVerify();
  }, [otp, handleVerify]);

  const handleResend = async () => {
    try {
      await sendOtp({ phone }).unwrap();
      setTimer(Config.OTP_RESEND_SECONDS);
      setCanResend(false);
      setOtp('');
      setError('');
    } catch {
      setError('Failed to resend OTP. Try again.');
    }
  };

  const maskedPhone = `${phone.slice(0, 3)} XXXXX ${phone.slice(-2)}`;

  return (
    <ScreenWrapper keyboardAvoiding scrollable>
      {/* Back */}
      <AppButton
        title="‹ Back"
        variant="ghost"
        size="sm"
        onPress={() => navigation.goBack()}
        style={styles.back}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <AppText style={styles.icon}>📱</AppText>
        </View>
        <AppText variant="h2" weight="bold" center>Verify OTP</AppText>
        <AppText variant="body" color="textSecondary" center>
          Enter the 6-digit code sent to
        </AppText>
        <AppText variant="body" weight="semibold" center>{maskedPhone}</AppText>
      </View>

      {/* OTP Input */}
      <View style={styles.otpWrapper}>
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
        {error ? (
          <AppText variant="caption" color="error" center style={styles.error}>{error}</AppText>
        ) : null}
      </View>

      {/* Verify Button */}
      <AppButton
        title="Verify OTP"
        onPress={handleVerify}
        loading={isLoading}
        disabled={otp.length < 6}
        fullWidth
        size="lg"
        style={styles.btn}
      />

      {/* Resend */}
      <View style={styles.resendRow}>
        <AppText variant="body" color="textSecondary">Didn't receive it? </AppText>
        {canResend ? (
          <AppButton
            title="Resend OTP"
            variant="ghost"
            size="sm"
            loading={isResending}
            onPress={handleResend}
          />
        ) : (
          <AppText variant="body" color="primary" weight="medium">
            Resend in {timer}s
          </AppText>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  back:        { alignSelf: 'flex-start', marginTop: Spacing.sm },
  header:      { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  iconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon:        { fontSize: 40 },
  otpWrapper:  { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
  error:       { marginTop: Spacing.xs },
  btn:         { marginTop: Spacing.md },
  resendRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
});

export default OtpVerifyScreen;
