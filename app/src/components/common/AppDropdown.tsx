import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing, Shadow, FontSize } from '@constants/theme';
import AppText from './AppText';

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface AppDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string | number | null;
  onChange: (option: DropdownOption) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
}

const AppDropdown = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  containerStyle,
}: AppDropdownProps) => {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);
  const borderColor = error ? Colors.error : open ? Colors.primary : Colors.border;

  const handleSelect = (option: DropdownOption) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="label" color="textSecondary">{label}</AppText>
          {required && <AppText variant="label" color="error"> *</AppText>}
        </View>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        style={[
          styles.trigger,
          {
            borderColor,
            backgroundColor: disabled ? Colors.surfaceVariant : Colors.surface,
          },
        ]}
      >
        <AppText
          style={{ fontSize: FontSize.md }}
          color={selected ? 'text' : 'textDisabled'}
        >
          {selected?.label ?? placeholder}
        </AppText>
        <AppText color="textSecondary" style={styles.chevron}>
          {open ? '▲' : '▼'}
        </AppText>
      </TouchableOpacity>

      {error && (
        <AppText variant="caption" color="error" style={styles.helperText}>
          {error}
        </AppText>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {label && (
              <AppText variant="label" weight="semibold" style={styles.sheetTitle}>
                {label}
              </AppText>
            )}
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                >
                  <AppText
                    style={{ fontSize: FontSize.md }}
                    color={item.value === value ? 'primary' : 'text'}
                    weight={item.value === value ? 'semibold' : 'regular'}
                  >
                    {item.label}
                  </AppText>
                  {item.value === value && (
                    <AppText color="primary">✓</AppText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { width: '100%' },
  labelRow:       { flexDirection: 'row', marginBottom: 6 },
  trigger:        {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
  },
  chevron:        { fontSize: 10 },
  helperText:     { marginTop: 4 },
  backdrop:       {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet:          {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '60%',
    ...Shadow.lg,
  },
  sheetTitle:     {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  option:         {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  optionSelected: { backgroundColor: Colors.primaryLight },
});

export default AppDropdown;
