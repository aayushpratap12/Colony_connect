import { baseApi } from './baseApi';
import type { SosAlert } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface TriggerParams {
  latitude?: number;
  longitude?: number;
}

export const sosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    triggerSos: build.mutation<SosAlert, TriggerParams>({
      query: (body) => ({ url: '/sos', method: 'POST', body }),
      transformResponse: (res: ApiResponse<SosAlert>) => res.data,
    }),

    getActiveSosAlerts: build.query<SosAlert[], void>({
      query: () => ({ url: '/sos', params: { active: true } }),
      transformResponse: (res: ApiResponse<SosAlert[]>) => res.data,
      providesTags: ['Residents'], // reuse tag for now
    }),

    resolveSos: build.mutation<{ id: string; status: string; resolvedAt: string }, string>({
      query: (id) => ({ url: `/sos/${id}/resolve`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<{ id: string; status: string; resolvedAt: string }>) => res.data,
      invalidatesTags: ['Residents'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useTriggerSosMutation,
  useGetActiveSosAlertsQuery,
  useResolveSosMutation,
} = sosApi;
