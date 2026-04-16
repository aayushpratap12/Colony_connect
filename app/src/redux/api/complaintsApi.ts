import { baseApi } from './baseApi';
import type { Complaint } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface ListParams {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  cursor?: string;
  limit?: number;
}

interface ListResponse {
  complaints: Complaint[];
  nextCursor: string | null;
}

interface CreateParams {
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'cleanliness' | 'other';
}

export const complaintsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getComplaints: build.query<ListResponse, ListParams>({
      query: ({ status, cursor, limit = 20 } = {}) => ({
        url: '/complaints',
        params: { status, cursor, limit },
      }),
      transformResponse: (res: ApiResponse<ListResponse>) => res.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.status ?? 'all'}`,
      merge: (cache, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        cache.complaints.push(...incoming.complaints);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Complaints'],
    }),

    getComplaint: build.query<Complaint, string>({
      query: (id) => `/complaints/${id}`,
      transformResponse: (res: ApiResponse<Complaint>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Complaints', id }],
    }),

    createComplaint: build.mutation<Complaint, CreateParams>({
      query: (body) => ({ url: '/complaints', method: 'POST', body }),
      transformResponse: (res: ApiResponse<Complaint>) => res.data,
      invalidatesTags: ['Complaints'],
    }),

    updateComplaintStatus: build.mutation<
      { id: string; status: string; updatedAt: string },
      { id: string; status: 'open' | 'in_progress' | 'resolved' | 'closed' }
    >({
      query: ({ id, status }) => ({
        url: `/complaints/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (res: ApiResponse<{ id: string; status: string; updatedAt: string }>) => res.data,
      invalidatesTags: ['Complaints'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetComplaintsQuery,
  useGetComplaintQuery,
  useCreateComplaintMutation,
  useUpdateComplaintStatusMutation,
} = complaintsApi;
