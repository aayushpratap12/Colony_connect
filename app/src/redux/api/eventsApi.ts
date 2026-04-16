import { baseApi } from './baseApi';
import type { Event } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface ListParams {
  cursor?: string;
  limit?: number;
  upcoming?: boolean;
}

interface ListResponse {
  events: Event[];
  nextCursor: string | null;
}

interface CreateParams {
  title: string;
  description: string;
  venue: string;
  eventDate: string;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getEvents: build.query<ListResponse, ListParams>({
      query: ({ cursor, limit = 20, upcoming = true } = {}) => ({
        url: '/events',
        params: { cursor, limit, upcoming },
      }),
      transformResponse: (res: ApiResponse<ListResponse>) => res.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.upcoming ?? true}`,
      merge: (cache, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        cache.events.push(...incoming.events);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Events'],
    }),

    getEvent: build.query<Event, string>({
      query: (id) => `/events/${id}`,
      transformResponse: (res: ApiResponse<Event>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Events', id }],
    }),

    createEvent: build.mutation<Event, CreateParams>({
      query: (body) => ({ url: '/events', method: 'POST', body }),
      transformResponse: (res: ApiResponse<Event>) => res.data,
      invalidatesTags: ['Events'],
    }),

    toggleRsvp: build.mutation<{ rsvped: boolean; rsvpCount: number }, string>({
      query: (id) => ({ url: `/events/${id}/rsvp`, method: 'POST' }),
      transformResponse: (res: ApiResponse<{ rsvped: boolean; rsvpCount: number }>) => res.data,
      // Optimistic update for RSVP toggle
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          // Update the event in list cache
          dispatch(
            eventsApi.util.updateQueryData('getEvents', {}, (draft) => {
              const event = draft.events.find((e) => e.id === id);
              if (event) {
                event.rsvpCount = data.rsvpCount;
                event.userRsvped = data.rsvped;
              }
            }),
          );
        } catch { /* rollback handled automatically */ }
      },
    }),

    deleteEvent: build.mutation<void, string>({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useToggleRsvpMutation,
  useDeleteEventMutation,
} = eventsApi;
