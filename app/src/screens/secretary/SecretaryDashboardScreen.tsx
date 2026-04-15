import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecretaryDashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>SecretaryDashboardScreen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  text: { fontSize: 18, color: '#0F172A', fontWeight: '600' },
});

export default SecretaryDashboardScreen;
