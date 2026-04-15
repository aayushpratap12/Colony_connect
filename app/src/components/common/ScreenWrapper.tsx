import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padHorizontal?: boolean;
}

const ScreenWrapper = ({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  style,
  contentStyle,
  padHorizontal = true,
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        padHorizontal && styles.horizontal,
        { paddingBottom: insets.bottom + Spacing.lg },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        padHorizontal && styles.horizontal,
        { paddingBottom: insets.bottom },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        style,
      ]}
    >
      {wrapped}
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  flex:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { flexGrow: 1 },
  horizontal:    { paddingHorizontal: Spacing.lg },
});

export default ScreenWrapper;
