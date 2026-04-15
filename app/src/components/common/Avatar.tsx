import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, FontWeight, Radius } from '@constants/theme';
import AppImage from './AppImage';
import AppText from './AppText';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: Size;
  role?: 'resident' | 'secretary' | 'guard';
}

const sizeMap: Record<Size, number> = { xs: 28, sm: 36, md: 44, lg: 56, xl: 72 };

const roleColorMap = {
  resident:  Colors.residentColor,
  secretary: Colors.secretaryColor,
  guard:     Colors.guardColor,
};

const Avatar = ({ uri, name = '', size = 'md', role }: AvatarProps) => {
  const dim = sizeMap[size];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const bgColor = role ? roleColorMap[role] : Colors.primary;

  if (uri) {
    return (
      <AppImage
        uri={uri}
        width={dim}
        height={dim}
        borderRadius={Radius.full}
        fallbackText={initials}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: dim, height: dim, backgroundColor: bgColor }]}>
      <AppText
        style={{ fontSize: dim * 0.36, fontWeight: FontWeight.semibold, color: Colors.textInverse }}
      >
        {initials || '?'}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
