import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@constants/theme';
import AppText from './AppText';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: Colors.success },
  error:   { bg: '#FEE2E2', text: Colors.error },
  warning: { bg: '#FEF3C7', text: Colors.warning },
  info:    { bg: Colors.primaryLight, text: Colors.primary },
  default: { bg: Colors.surfaceVariant, text: Colors.textSecondary },
};

const Badge = ({ label, variant = 'default', dot = false }: BadgeProps) => {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: text }]} />}
      <AppText variant="caption" weight="medium" style={{ color: text }}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
});

export default Badge;
