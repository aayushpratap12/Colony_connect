import { baseApi } from './baseApi';
import type { Visitor } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface ListParams {
  cursor?: string;
  limit?: number;
  status?: string;
}

interface ListResponse {
  visitors: Visitor[];
  nextCursor: string | null;
}

interface CreateParams {
  visitorName: string;
  purpose: string;
  vehicleNumber?: string;
}


export const visitorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getVisitors: build.query<ListResponse, ListParams>({
      query: ({ cursor, limit = 20, status } = {}) => ({
        url: '/visitors',
        params: { cursor, limit, status },
      }),
      transformResponse: (res: ApiResponse<ListResponse>) => res.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}:${queryArgs.status ?? 'all'}`,
      merge: (cache, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        cache.visitors.push(...incoming.visitors);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Visitors'],
    }),

    createVisitorPass: build.mutation<Visitor, CreateParams>({
      query: (body) => ({ url: '/visitors', method: 'POST', body }),
      transformResponse: (res: ApiResponse<Visitor>) => res.data,
      invalidatesTags: ['Visitors'],
    }),

    verifyVisitorOtp: build.query<Visitor, string>({
      query: (otp) => `/visitors/verify/${otp}`,
      transformResponse: (res: ApiResponse<Visitor>) => res.data,
    }),

    approveVisitor: build.mutation<{ id: string; status: string }, string>({
      query: (id) => ({ url: `/visitors/${id}/approve`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<{ id: string; status: string }>) => res.data,
      invalidatesTags: ['Visitors'],
    }),

    markVisitorEntry: build.mutation<{ id: string; status: string; entryTime: string }, string>({
      query: (id) => ({ url: `/visitors/${id}/entry`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<{ id: string; status: string; entryTime: string }>) => res.data,
      invalidatesTags: ['Visitors'],
    }),

    markVisitorExit: build.mutation<{ id: string; status: string; exitTime: string }, string>({
      query: (id) => ({ url: `/visitors/${id}/exit`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<{ id: string; status: string; exitTime: string }>) => res.data,
      invalidatesTags: ['Visitors'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetVisitorsQuery,
  useCreateVisitorPassMutation,
  useVerifyVisitorOtpQuery,
  useLazyVerifyVisitorOtpQuery,
  useApproveVisitorMutation,
  useMarkVisitorEntryMutation,
  useMarkVisitorExitMutation,
} = visitorsApi;
