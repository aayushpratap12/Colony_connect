import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetListingsQuery } from '@redux/api/marketplaceApi';
import type { MarketplaceListing } from '@typings/models.types';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';

type Nav = NativeStackNavigationProp<ResidentStackParamList>;

const ListingCard = ({ item, onPress }: { item: MarketplaceListing; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.imageBox}>
      {item.imageUrls.length > 0 ? (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color={Colors.textDisabled} />
        </View>
      )}
    </View>
    <View style={styles.cardBody}>
      <AppText variant="bodySmall" weight="semibold" numberOfLines={1}>{item.title}</AppText>
      <AppText variant="caption" color="textSecondary" numberOfLines={1} style={{ marginTop: 2 }}>{item.description}</AppText>
      <View style={styles.cardFooter}>
        <AppText variant="bodySmall" weight="bold" color="primary">₹{item.price.toLocaleString('en-IN')}</AppText>
        <AppText variant="caption" color="textSecondary">{item.sellerName}</AppText>
      </View>
    </View>
  </TouchableOpacity>
);

const ResidentMarketplaceScreen = () => {
  const navigation = useNavigation<Nav>();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, refetch } = useGetListingsQuery({ cursor });

  const onLoadMore = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const onRefresh = useCallback(() => { setCursor(undefined); refetch(); }, [refetch]);

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <AppText variant="h3" weight="bold">Marketplace</AppText>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate(Routes.CREATE_LISTING)}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.listings ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ListingCard item={item} onPress={() => navigation.navigate(Routes.MARKETPLACE_DETAIL, { listingId: item.id })} />
          )}
          contentContainerStyle={styles.list}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="storefront-outline" size={48} color={Colors.textDisabled} />
              <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No listings yet</AppText>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  imageBox: { width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceVariant },
  cardBody: { padding: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ResidentMarketplaceScreen;
