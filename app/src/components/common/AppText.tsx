import React from 'react';
import { Text, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { Colors, FontSize, FontWeight } from '@constants/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
type Weight = keyof typeof FontWeight;
type Color = keyof typeof Colors;

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: Color;
  center?: boolean;
  style?: TextStyle;
}

const variantStyles: Record<Variant, TextStyle> = {
  h1:        { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold },
  h2:        { fontSize: FontSize.xxl,  fontWeight: FontWeight.bold },
  h3:        { fontSize: FontSize.xl,   fontWeight: FontWeight.semibold },
  body:      { fontSize: FontSize.md,   fontWeight: FontWeight.regular },
  bodySmall: { fontSize: FontSize.sm,   fontWeight: FontWeight.regular },
  caption:   { fontSize: FontSize.xs,   fontWeight: FontWeight.regular },
  label:     { fontSize: FontSize.sm,   fontWeight: FontWeight.medium },
};

const AppText = ({
  variant = 'body',
  weight,
  color = 'text',
  center = false,
  style,
  children,
  ...rest
}: AppTextProps) => (
  <Text
    style={[
      variantStyles[variant],
      { color: Colors[color] },
      center && styles.center,
      weight && { fontWeight: FontWeight[weight] },
      style,
    ]}
    {...rest}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});

export default AppText;
