import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@constants/theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const OtpInput = ({ length = 6, value, onChange, disabled = false }: OtpInputProps) => {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) digits.push('');

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={1}
          onPress={() => inputs.current[i]?.focus()}
        >
          <View
            style={[
              styles.cell,
              focused === i && styles.cellFocused,
              digit && styles.cellFilled,
            ]}
          >
            <TextInput
              ref={(ref) => { inputs.current[i] = ref; }}
              style={styles.cellText}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(null)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              selectTextOnFocus
              caretHidden
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CELL_SIZE = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cellFilled: {
    borderColor: Colors.primary,
  },
  cellText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    width: CELL_SIZE,
    height: CELL_SIZE,
    padding: 0,
  },
});

export default OtpInput;
