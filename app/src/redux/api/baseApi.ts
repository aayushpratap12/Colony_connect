import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@redux/store';
import { Config } from '@constants/config';
import { logout, setTokens } from '@redux/slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: `${Config.API_URL}/api`,
  timeout: Config.API_TIMEOUT,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Auto refresh token on 401
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefresh } = (refreshResult.data as any).data;
        api.dispatch(setTokens({ accessToken, refreshToken: newRefresh }));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Announcements',
    'Complaints',
    'Events',
    'Marketplace',
    'Visitors',
    'Residents',
    'Profile',
    'ChatRooms',
  ],
  endpoints: () => ({}),
});
