import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGetMessagesQuery, useSendMessageMutation } from '@redux/api/chatApi';
import useAppSelector from '@hooks/useAppSelector';
import type { RootState } from '@redux/store';
import { getSocket } from '@services/socket';
import type { Message } from '@typings/models.types';
import type { ResidentStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors, Spacing, Radius, FontSize } from '@constants/theme';
import AppText from '@components/common/AppText';
import Avatar from '@components/common/Avatar';

type Props = NativeStackScreenProps<ResidentStackParamList, typeof Routes.CHAT_ROOM>;

const MessageBubble = ({ item, isMe }: { item: Message; isMe: boolean }) => (
  <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapMe]}>
    {!isMe && <Avatar name={item.senderName} size="xs" role="resident" style={styles.avatar} />}
    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
      {!isMe && (
        <AppText variant="caption" weight="semibold" color="primary" style={{ marginBottom: 2 }}>
          {item.senderName}
        </AppText>
      )}
      <AppText variant="bodySmall" style={{ color: isMe ? Colors.textInverse : Colors.text }}>
        {item.content}
      </AppText>
      <AppText variant="caption" style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : Colors.textDisabled }]}>
        {new Date(item.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
      </AppText>
    </View>
  </View>
);

const ChatRoomScreen = ({ route, navigation }: Props) => {
  const { roomId, roomName } = route.params;
  const userId = useAppSelector((s: RootState) => s.auth.user?.id);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const { data, isLoading, isFetching } = useGetMessagesQuery({ roomId, cursor });
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  // Join socket room
  useEffect(() => {
    try {
      const socket = getSocket();
      socket.emit('room:join', roomId);
      return () => { socket.emit('room:leave', roomId); };
    } catch { /* socket not ready */ }
  }, [roomId]);

  const onSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    try {
      await sendMessage({ roomId, content: trimmed }).unwrap();
      listRef.current?.scrollToEnd({ animated: true });
    } catch { /* ignore */ }
  }, [text, sending, roomId, sendMessage]);

  const onLoadOlder = useCallback(() => {
    if (data?.nextCursor && !isFetching) setCursor(data.nextCursor);
  }, [data?.nextCursor, isFetching]);

  const messages = data?.messages ?? [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">{roomName}</AppText>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} isMe={item.senderId === userId} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
          onEndReached={onLoadOlder}
          ListHeaderComponent={isFetching ? () => <ActivityIndicator size="small" color={Colors.primary} style={{ margin: Spacing.sm }} /> : null}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.centered}>
              <AppText variant="body" color="textSecondary" center>No messages yet. Say hello!</AppText>
            </View>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={Colors.textDisabled}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color={Colors.textInverse} />
            : <Ionicons name="send" size={18} color={Colors.textInverse} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, paddingBottom: Spacing.sm },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.sm },
  bubbleWrapMe: { flexDirection: 'row-reverse' },
  avatar: { marginRight: Spacing.xs },
  bubble: { maxWidth: '75%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.borderLight },
  time: { fontSize: FontSize.xs, marginTop: 2, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.surfaceVariant, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.textDisabled },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xxl },
});

export default ChatRoomScreen;
