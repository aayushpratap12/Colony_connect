import { baseApi } from './baseApi';
import type { ChatRoom, Message } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface MessagesParams {
  roomId: string;
  cursor?: string;
  limit?: number;
}

interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

interface SendMessageParams {
  roomId: string;
  content?: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getChatRooms: build.query<ChatRoom[], void>({
      query: () => '/chat/rooms',
      transformResponse: (res: ApiResponse<ChatRoom[]>) => res.data,
      providesTags: ['ChatRooms'],
    }),

    getMessages: build.query<MessagesResponse, MessagesParams>({
      query: ({ roomId, cursor, limit = 30 }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        params: { cursor, limit },
      }),
      transformResponse: (res: ApiResponse<MessagesResponse>) => res.data,
      serializeQueryArgs: ({ queryArgs }) => `messages-${queryArgs.roomId}`,
      merge: (cache, incoming, { arg }) => {
        // Older messages come prepended (cursor = going backwards)
        if (!arg.cursor) return incoming;
        cache.messages.unshift(...incoming.messages);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
    }),

    sendMessage: build.mutation<Message, SendMessageParams>({
      query: ({ roomId, ...body }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<Message>) => res.data,
      // Optimistically append message to cache
      async onQueryStarted({ roomId }, { dispatch, queryFulfilled }) {
        try {
          const { data: message } = await queryFulfilled;
          dispatch(
            chatApi.util.updateQueryData('getMessages', { roomId }, (draft) => {
              draft.messages.push(message);
            }),
          );
          // Refresh room list so lastMessage updates
          dispatch(chatApi.util.invalidateTags(['ChatRooms']));
        } catch { /* ignore */ }
      },
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetChatRoomsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
