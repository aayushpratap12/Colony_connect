import { baseApi } from './baseApi';
import type { Announcement } from '@typings/models.types';

// ─── Request / Response types ─────────────────────────────────────────────────
interface ListParams {
  cursor?: string;
  limit?: number;
}

interface ListResponse {
  announcements: Announcement[];
  nextCursor: string | null;
}

interface CreateParams {
  title: string;
  body: string;
}

// ─── Announcements API slice ──────────────────────────────────────────────────
export const announcementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getAnnouncements: build.query<ListResponse, ListParams>({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/announcements',
        params: { cursor, limit },
      }),
      transformResponse: (res: { success: boolean; data: ListResponse }) => res.data,
      // Merge pages for infinite scroll
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (cache, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        cache.announcements.push(...incoming.announcements);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Announcements'],
    }),

    createAnnouncement: build.mutation<Announcement, CreateParams>({
      query: (body) => ({ url: '/announcements', method: 'POST', body }),
      transformResponse: (res: { success: boolean; data: Announcement }) => res.data,
      invalidatesTags: ['Announcements'],
    }),

    togglePin: build.mutation<{ isPinned: boolean }, string>({
      query: (id) => ({ url: `/announcements/${id}/pin`, method: 'PATCH' }),
      transformResponse: (res: { success: boolean; data: { isPinned: boolean } }) => res.data,
      invalidatesTags: ['Announcements'],
    }),

    deleteAnnouncement: build.mutation<void, string>({
      query: (id) => ({ url: `/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Announcements'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useTogglePinMutation,
  useDeleteAnnouncementMutation,
} = announcementsApi;
