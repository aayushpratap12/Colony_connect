import React, { useRef, useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, FontSize } from '@constants/theme';
import { AppText, AppButton, ScreenWrapper } from '@components/common';
import type { AuthStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🏘️',
    title: 'Your Colony,\nOne App',
    subtitle: 'Announcements, complaints, events — everything your colony needs in one place.',
  },
  {
    id: '2',
    emoji: '🚨',
    title: 'SOS at\nOne Tap',
    subtitle: 'Emergency alerts reach your neighbours instantly. Safety is just a tap away.',
  },
  {
    id: '3',
    emoji: '🔐',
    title: 'Secure &\nPrivate',
    subtitle: 'End-to-end encrypted chats. Geo-fenced access. Only colony members get in.',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<Nav>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dotProgress = useSharedValue(0);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
      dotProgress.value = withTiming(next);
    } else {
      navigation.navigate(Routes.LOGIN);
    }
  };

  const handleSkip = () => navigation.navigate(Routes.LOGIN);

  return (
    <ScreenWrapper>
      {/* Skip */}
      <View style={styles.skipRow}>
        {activeIndex < SLIDES.length - 1 && (
          <AppButton title="Skip" variant="ghost" size="sm" onPress={handleSkip} />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.emojiWrapper}>
              <AppText style={styles.emoji}>{item.emoji}</AppText>
            </View>
            <AppText variant="h1" center style={styles.title}>{item.title}</AppText>
            <AppText variant="body" color="textSecondary" center style={styles.subtitle}>
              {item.subtitle}
            </AppText>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <Dot key={i} active={i === activeIndex} />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.btnWrapper}>
        <AppButton
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
};

const Dot = ({ active }: { active: boolean }) => {
  const animStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 24 : 8, { duration: 250 }),
    opacity: withTiming(active ? 1 : 0.35, { duration: 250 }),
  }));
  return (
    <Animated.View
      style={[{ height: 8, borderRadius: Radius.full, backgroundColor: Colors.primary }, animStyle]}
    />
  );
};

const styles = StyleSheet.create({
  skipRow:     { alignItems: 'flex-end', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  slide:       {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emojiWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emoji:       { fontSize: 56 },
  title:       { marginBottom: Spacing.md, lineHeight: FontSize.xxxl * 1.2 },
  subtitle:    { lineHeight: 24 },
  dotsRow:     {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  btnWrapper:  { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
});

export default OnboardingScreen;
