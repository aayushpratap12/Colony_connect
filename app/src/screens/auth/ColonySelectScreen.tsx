import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Colors, Spacing, Radius, FontWeight } from '@constants/theme';
import { AppText, AppTextInput, AppButton, ScreenWrapper, AppCard } from '@components/common';
import { useGetColoniesQuery } from '@redux/api/authApi';
import type { AuthStackParamList, AuthScreenProps } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const ColonySelectScreen = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<AuthScreenProps<typeof Routes.COLONY_SELECT>['route']>();
  const { phone } = params;

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data, isLoading } = useGetColoniesQuery(
    coords ? { lat: coords.lat, lng: coords.lng } : {},
  );

  type ColonyItem = NonNullable<typeof data>['data'][number];
  const colonies: ColonyItem[] = data?.data ?? [];

  const filtered = colonies.filter((c: ColonyItem) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    };
    fetchLocation();
  }, []);

  const handleSelect = () => {
    if (!selectedId) return;
    navigation.navigate(Routes.REGISTER, { phone, colonyId: selectedId });
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <AppButton
          title="‹ Back"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.back}
        />
        <AppText variant="h2" weight="bold">Select Colony</AppText>
        <AppText variant="body" color="textSecondary">
          {coords ? 'Showing colonies near you' : 'Search for your colony'}
        </AppText>
      </View>

      {/* Search */}
      <AppTextInput
        placeholder="Search by colony name or area..."
        value={search}
        onChangeText={setSearch}
        leftIcon={<AppText>🔍</AppText>}
        containerStyle={styles.search}
      />

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <AppText color="textSecondary">Finding colonies...</AppText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <AppText color="textSecondary">No colonies found</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity onPress={() => setSelectedId(item.id)} activeOpacity={0.85}>
                <AppCard
                  style={isSelected ? [styles.card, styles.cardSelected] : styles.card}
                  shadow="sm"
                >
                  <View style={styles.cardRow}>
                    <View style={styles.cardIcon}>
                      <AppText style={styles.cardEmoji}>🏘️</AppText>
                    </View>
                    <View style={styles.cardInfo}>
                      <AppText variant="body" weight="semibold">{item.name}</AppText>
                      <AppText variant="caption" color="textSecondary">{item.address}</AppText>
                      <AppText variant="caption" color="textSecondary">
                        {item.totalUnits} units
                        {item.distanceMeters
                          ? `  •  ${(item.distanceMeters / 1000).toFixed(1)} km away`
                          : ''}
                      </AppText>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <AppText style={styles.check}>✓</AppText>
                      </View>
                    )}
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* CTA */}
      <View style={styles.footer}>
        <AppButton
          title="Continue"
          onPress={handleSelect}
          disabled={!selectedId}
          fullWidth
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header:      { gap: Spacing.xs, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  back:        { alignSelf: 'flex-start', marginBottom: Spacing.xs },
  search:      { marginBottom: Spacing.md },
  list:        { gap: Spacing.sm, paddingBottom: Spacing.xl },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
  card:        { borderWidth: 1.5, borderColor: Colors.border },
  cardSelected:{ borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cardRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIcon:    {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji:   { fontSize: 22 },
  cardInfo:    { flex: 1, gap: 2 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  check:       { color: Colors.textInverse, fontWeight: FontWeight.bold },
  footer:      { paddingTop: Spacing.md, paddingBottom: Spacing.lg },
});

export default ColonySelectScreen;
