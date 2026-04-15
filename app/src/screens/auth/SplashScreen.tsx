import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight } from '@constants/theme';
import { AppText } from '@components/common';
import useAppDispatch from '@hooks/useAppDispatch';
import { setLoading } from '@redux/slices/authSlice';

const SplashScreen = () => {
  const dispatch = useAppDispatch();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const finishSplash = () => dispatch(setLoading(false));

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 600 }),
      withTiming(1, { duration: 1200 }),
      withTiming(0, { duration: 400 }, (done) => {
        if (done) runOnJS(finishSplash)();
      }),
    );
    scale.value = withTiming(1, { duration: 600 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, animStyle]}>
        <View style={styles.logoCircle}>
          <AppText style={styles.logoText}>CC</AppText>
        </View>
        <AppText style={styles.appName}>Colony Connect</AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.tagline}>
          Your colony, connected
        </AppText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoWrapper: { alignItems: 'center', gap: 12 },
  logoCircle:  {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.textInverse,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.primary },
  appName:  { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textInverse },
  tagline:  { color: Colors.primaryLight },
});

export default SplashScreen;
