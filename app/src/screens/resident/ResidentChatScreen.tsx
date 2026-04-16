import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetChatRoomsQuery } from '@redux/api/chatApi';
import type { ChatRoom } from '@typings/models.types';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius } from '@constants/theme';
import ScreenWrapper from '@components/common/ScreenWrapper';
import AppText from '@components/common/AppText';

type Nav = NativeStackNavigationProp<ResidentStackParamList>;

const ROOM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  general:     'chatbubbles-outline',
  maintenance: 'construct-outline',
  events:      'calendar-outline',
  private:     'lock-closed-outline',
};

const timeLabel = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(diff / 60000)}m`;
};

const RoomRow = ({ item, onPress }: { item: ChatRoom; onPress: () => void }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Ionicons name={ROOM_ICONS[item.type] ?? 'chatbubble-outline'} size={22} color={Colors.primary} />
    </View>
    <View style={{ flex: 1, marginLeft: Spacing.md }}>
      <View style={styles.rowTop}>
        <AppText variant="bodySmall" weight="semibold">{item.name}</AppText>
        {item.lastMessageAt && (
          <AppText variant="caption" color="textSecondary">{timeLabel(item.lastMessageAt)}</AppText>
        )}
      </View>
      {item.lastMessage ? (
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {item.lastSenderName ? `${item.lastSenderName}: ` : ''}{item.lastMessage}
        </AppText>
      ) : (
        <AppText variant="caption" color="textDisabled">No messages yet</AppText>
      )}
    </View>
    <Ionicons name="chevron-forward" size={16} color={Colors.textDisabled} style={{ marginLeft: Spacing.sm }} />
  </TouchableOpacity>
);

const ResidentChatScreen = () => {
  const navigation = useNavigation<Nav>();
  const { data: rooms = [], isLoading } = useGetChatRoomsQuery();

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padHorizontal={false}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <AppText variant="h3" weight="bold">Community Chat</AppText>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomRow item={item} onPress={() => navigation.navigate(Routes.CHAT_ROOM, { roomId: item.id, roomName: item.name })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textDisabled} />
            <AppText variant="body" color="textSecondary" center style={{ marginTop: Spacing.md }}>No chat rooms yet</AppText>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  list: { paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 46, height: 46, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.lg + 46 + Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ResidentChatScreen;
