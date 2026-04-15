import React from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '@constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: keyof typeof Shadow;
}

const AppCard = ({
  children,
  onPress,
  style,
  padding = Spacing.md,
  shadow = 'sm',
}: AppCardProps) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.card, Shadow[shadow], { padding }, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, Shadow[shadow], { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});

export default AppCard;
