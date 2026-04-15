import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing, FontSize } from '@constants/theme';
import AppText from './AppText';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const AppTextInput = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required = false,
  editable = true,
  ...rest
}: AppTextInputProps) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.error
    : focused
    ? Colors.primary
    : Colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="label" color="textSecondary">
            {label}
          </AppText>
          {required && (
            <AppText variant="label" color="error"> *</AppText>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: editable ? Colors.surface : Colors.surfaceVariant,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon  && styles.inputWithLeft,
            rightIcon && styles.inputWithRight,
            { color: Colors.text },
          ]}
          placeholderTextColor={Colors.textDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || hint) && (
        <AppText
          variant="caption"
          color={error ? 'error' : 'textSecondary'}
          style={styles.helperText}
        >
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { width: '100%' },
  labelRow:       { flexDirection: 'row', marginBottom: 6 },
  inputWrapper:   {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    minHeight: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
  },
  inputWithLeft:  { paddingLeft: 4 },
  inputWithRight: { paddingRight: 4 },
  iconLeft:       { paddingLeft: Spacing.md },
  iconRight:      { paddingRight: Spacing.md },
  helperText:     { marginTop: 4 },
});

export default AppTextInput;
