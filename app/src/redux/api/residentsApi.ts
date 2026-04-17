import { baseApi } from './baseApi';
import type { User } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

export const residentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getResidents: build.query<User[], { role?: string }>({
      query: ({ role } = {}) => ({
        url: '/residents',
        params: role ? { role } : undefined,
      }),
      transformResponse: (res: ApiResponse<User[]>) => res.data,
      providesTags: ['Residents'],
    }),

  }),
  overrideExisting: false,
});

export const { useGetResidentsQuery } = residentsApi;
