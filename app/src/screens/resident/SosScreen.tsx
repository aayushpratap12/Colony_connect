import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTriggerSosMutation } from '@redux/api/sosApi';
import { Colors, Spacing, Radius, Shadow, FontSize, FontWeight } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';

const SosScreen = () => {
  const navigation = useNavigation();
  const [triggerSos, { isLoading }] = useTriggerSosMutation();
  const [triggered, setTriggered] = useState(false);

  const onPress = () => {
    Alert.alert(
      'Send SOS Alert?',
      'This will immediately alert security and all colony members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              await triggerSos({}).unwrap();
              setTriggered(true);
            } catch {
              Alert.alert('Error', 'Could not send SOS. Please call security directly.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Emergency SOS</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {triggered ? (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            </View>
            <AppText variant="h3" weight="bold" center style={{ marginTop: Spacing.lg }}>Alert Sent!</AppText>
            <AppText variant="body" color="textSecondary" center style={styles.subtitle}>
              Security and neighbours have been notified. Help is on the way.
            </AppText>
            <TouchableOpacity style={styles.dismissBtn} onPress={() => navigation.goBack()}>
              <AppText variant="bodySmall" weight="medium" color="primary">Go Back</AppText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppText variant="body" color="textSecondary" center style={styles.subtitle}>
              Press the button below to immediately alert security and all colony members of an emergency.
            </AppText>

            <TouchableOpacity
              style={[styles.sosButton, isLoading && styles.sosButtonDisabled]}
              onPress={onPress}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={Colors.textInverse} />
              ) : (
                <>
                  <Ionicons name="warning" size={48} color={Colors.textInverse} />
                  <AppText style={styles.sosLabel}>SOS</AppText>
                  <AppText style={styles.sosHint}>Hold to send emergency alert</AppText>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <AppText variant="caption" color="textSecondary" style={{ flex: 1, marginLeft: Spacing.sm }}>
                Only use this in a real emergency. False alerts may be reported to the secretary.
              </AppText>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  subtitle: { lineHeight: 22, marginBottom: Spacing.xl },
  sosButton: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.sosRed,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.lg,
  },
  sosButtonDisabled: { backgroundColor: Colors.textDisabled },
  sosLabel: { color: Colors.textInverse, fontSize: 32, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  sosHint: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, marginTop: 4, textAlign: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.xl, backgroundColor: Colors.surfaceVariant, padding: Spacing.md, borderRadius: Radius.md },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  dismissBtn: { marginTop: Spacing.xl, padding: Spacing.md },
});

export default SosScreen;
