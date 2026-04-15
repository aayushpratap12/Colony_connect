import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadow } from '@constants/theme';
import AppText from '@components/common/AppText';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

const AppHeader = ({
  title,
  subtitle,
  showBack = false,
  rightElement,
  transparent = false,
}: AppHeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + Spacing.sm },
        !transparent && styles.solid,
      ]}
    >
      <View style={styles.row}>
        {/* Left */}
        <View style={styles.side}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
              <AppText variant="h3" color="text">‹</AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <AppText variant="h3" weight="semibold" numberOfLines={1}>{title}</AppText>
          {subtitle && (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>{subtitle}</AppText>
          )}
        </View>

        {/* Right */}
        <View style={styles.side}>
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  solid: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side:    { width: 44, alignItems: 'center' },
  center:  { flex: 1, alignItems: 'center' },
  backBtn: { padding: 4 },
});

export default AppHeader;
