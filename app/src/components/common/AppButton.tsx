import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '@constants/theme';
import AppText from './AppText';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantConfig: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: Colors.primary,        text: Colors.textInverse },
  secondary: { bg: Colors.primaryLight,   text: Colors.primary },
  outline:   { bg: Colors.transparent,    text: Colors.primary,    border: Colors.primary },
  ghost:     { bg: Colors.transparent,    text: Colors.primary },
  danger:    { bg: Colors.error,          text: Colors.textInverse },
};

const sizeConfig: Record<Size, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: Spacing.md,  fontSize: FontSize.sm },
  md: { height: 48, px: Spacing.lg,  fontSize: FontSize.md },
  lg: { height: 56, px: Spacing.xl,  fontSize: FontSize.lg },
};

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: AppButtonProps) => {
  const vc = variantConfig[variant];
  const sc = sizeConfig[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: vc.bg,
          height: sc.height,
          paddingHorizontal: sc.px,
          borderColor: vc.border ?? Colors.transparent,
          borderWidth: vc.border ? 1.5 : 0,
          borderRadius: Radius.md,
          opacity: isDisabled ? 0.55 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vc.text} size="small" />
      ) : (
        <AppText
          style={[
            {
              color: vc.text,
              fontSize: sc.fontSize,
              fontWeight: FontWeight.semibold,
            },
            textStyle,
          ]}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
});

export default AppButton;
