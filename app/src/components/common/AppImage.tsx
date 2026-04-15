import React, { useState } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius } from '@constants/theme';
import AppText from './AppText';

type ResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

interface AppImageProps {
  uri?: string | null;
  fallbackText?: string;       // initials / icon text shown when no image
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  resizeMode?: ResizeMode;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

const AppImage = ({
  uri,
  fallbackText,
  width = '100%',
  height = 200,
  borderRadius = Radius.md,
  resizeMode = 'cover',
  style,
  containerStyle,
}: AppImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const showFallback = !uri || error;

  return (
    <View
      style={[
        styles.wrapper,
        { width: width as number, height: height as number, borderRadius },
        containerStyle,
      ]}
    >
      {showFallback ? (
        <View style={[styles.fallback, { borderRadius }]}>
          {fallbackText ? (
            <AppText variant="h3" color="textSecondary" weight="semibold">
              {fallbackText.slice(0, 2).toUpperCase()}
            </AppText>
          ) : (
            <AppText color="textDisabled">No Image</AppText>
          )}
        </View>
      ) : (
        <>
          <Image
            source={{ uri }}
            style={[styles.image, { borderRadius }, style]}
            resizeMode={resizeMode}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
          />
          {loading && (
            <View style={[styles.loader, { borderRadius }]}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:  { overflow: 'hidden' },
  image:    { width: '100%', height: '100%' },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  loader:   {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
});

export default AppImage;
