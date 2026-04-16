import { baseApi } from './baseApi';
import type { MarketplaceListing } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface ListParams {
  category?: string;
  cursor?: string;
  limit?: number;
}

interface ListResponse {
  listings: MarketplaceListing[];
  nextCursor: string | null;
}

interface CreateParams {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls?: string[];
}

interface UpdateStatusParams {
  id: string;
  status: 'active' | 'sold' | 'removed';
}

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getListings: build.query<ListResponse, ListParams>({
      query: ({ category, cursor, limit = 20 } = {}) => ({
        url: '/marketplace',
        params: { category, cursor, limit },
      }),
      transformResponse: (res: ApiResponse<ListResponse>) => res.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.category ?? 'all'}`,
      merge: (cache, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        cache.listings.push(...incoming.listings);
        cache.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Marketplace'],
    }),

    getListing: build.query<MarketplaceListing, string>({
      query: (id) => `/marketplace/${id}`,
      transformResponse: (res: ApiResponse<MarketplaceListing>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Marketplace', id }],
    }),

    createListing: build.mutation<MarketplaceListing, CreateParams>({
      query: (body) => ({ url: '/marketplace', method: 'POST', body }),
      transformResponse: (res: ApiResponse<MarketplaceListing>) => res.data,
      invalidatesTags: ['Marketplace'],
    }),

    updateListing: build.mutation<Partial<MarketplaceListing>, { id: string } & Partial<CreateParams>>({
      query: ({ id, ...body }) => ({ url: `/marketplace/${id}`, method: 'PATCH', body }),
      transformResponse: (res: ApiResponse<Partial<MarketplaceListing>>) => res.data,
      invalidatesTags: ['Marketplace'],
    }),

    updateListingStatus: build.mutation<{ id: string; status: string }, UpdateStatusParams>({
      query: ({ id, status }) => ({
        url: `/marketplace/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (res: ApiResponse<{ id: string; status: string }>) => res.data,
      invalidatesTags: ['Marketplace'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useUpdateListingStatusMutation,
} = marketplaceApi;
