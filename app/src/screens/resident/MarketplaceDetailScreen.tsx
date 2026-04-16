import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetListingQuery, useUpdateListingStatusMutation } from '@redux/api/marketplaceApi';
import useAppSelector from '@hooks/useAppSelector';
import type { RootState } from '@redux/store';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius, Shadow } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';
import AppButton from '@components/common/AppButton';
import Avatar from '@components/common/Avatar';

type Props = NativeStackScreenProps<ResidentStackParamList, typeof Routes.MARKETPLACE_DETAIL>;

const MarketplaceDetailScreen = ({ route, navigation }: Props) => {
  const { listingId } = route.params;
  const { data: listing, isLoading } = useGetListingQuery(listingId);
  const [updateStatus, { isLoading: updating }] = useUpdateListingStatusMutation();
  const userId = useAppSelector((s: RootState) => s.auth.user?.id);

  const isMine = listing?.sellerId === userId;

  const onMarkSold = () => {
    Alert.alert('Mark as Sold', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await updateStatus({ id: listingId, status: 'sold' }).unwrap();
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Could not update listing');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenWrapper>
    );
  }

  if (!listing) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}><AppText color="textSecondary">Listing not found</AppText></View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">Listing</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {listing.imageUrls.length > 0 ? (
          <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color={Colors.textDisabled} />
          </View>
        )}

        <View style={styles.priceRow}>
          <AppText variant="h2" weight="bold" color="primary">₹{listing.price.toLocaleString('en-IN')}</AppText>
          {listing.status !== 'active' && (
            <View style={styles.soldBadge}>
              <AppText variant="caption" weight="bold" style={{ color: Colors.textInverse }}>{listing.status.toUpperCase()}</AppText>
            </View>
          )}
        </View>

        <AppText variant="h3" weight="semibold" style={styles.title}>{listing.title}</AppText>
        <View style={styles.categoryBadge}>
          <AppText variant="caption" color="primary" weight="medium">{listing.category}</AppText>
        </View>

        <AppText variant="body" color="textSecondary" style={styles.description}>{listing.description}</AppText>

        <View style={styles.sellerCard}>
          <Avatar name={listing.sellerName} size="sm" role="resident" />
          <View style={{ marginLeft: Spacing.md }}>
            <AppText variant="bodySmall" weight="semibold">{listing.sellerName}</AppText>
            <AppText variant="caption" color="textSecondary">Flat {listing.flatNumber}</AppText>
          </View>
        </View>

        {isMine && listing.status === 'active' && (
          <AppButton title="Mark as Sold" onPress={onMarkSold} loading={updating} variant="outline" style={styles.actionBtn} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: Spacing.xxl },
  image: { width: '100%', height: 280 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  soldBadge: { backgroundColor: Colors.textSecondary, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  title: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xs },
  categoryBadge: { marginHorizontal: Spacing.lg, marginTop: Spacing.xs, alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  description: { paddingHorizontal: Spacing.lg, marginTop: Spacing.md, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', margin: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, ...Shadow.sm },
  actionBtn: { marginHorizontal: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default MarketplaceDetailScreen;
