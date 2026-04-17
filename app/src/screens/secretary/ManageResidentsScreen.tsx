import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGetResidentsQuery } from '@redux/api/residentsApi';
import type { User } from '@typings/models.types';
import { Colors, Spacing, Radius, FontSize } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import Avatar from '@components/common/Avatar';

const ResidentRow = ({ item }: { item: User }) => (
  <View style={styles.row}>
    <Avatar name={item.name} size="sm" role="resident" />
    <View style={{ flex: 1, marginLeft: Spacing.md }}>
      <AppText variant="bodySmall" weight="semibold">{item.name}</AppText>
      <AppText variant="caption" color="textSecondary">{item.phone}</AppText>
    </View>
    <View style={styles.rightCol}>
      {item.flatNumber && (
        <View style={styles.flatBadge}>
          <AppText variant="caption" color="primary" weight="medium">Flat {item.flatNumber}</AppText>
        </View>
      )}
      {!item.isVerified && (
        <AppText variant="caption" style={styles.unverified}>Unverified</AppText>
      )}
    </View>
  </View>
);

const ManageResidentsScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const { data: residents = [], isLoading } = useGetResidentsQuery({ role: 'resident' });

  const filtered = search.trim()
    ? residents.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.flatNumber?.includes(search) ||
        r.phone.includes(search),
      )
    : residents;

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Residents ({residents.length})</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, flat or phone..."
          placeholderTextColor={Colors.textDisabled}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ResidentRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>
                {search ? 'No results found' : 'No residents yet'}
              </AppText>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: Spacing.lg, marginBottom: 0, backgroundColor: Colors.surfaceVariant, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 0 },
  list: { paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  flatBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  unverified: { color: Colors.warning, fontSize: FontSize.xs },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.lg + 40 + Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ManageResidentsScreen;
