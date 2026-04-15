import { baseApi } from './baseApi';
import { setCredentials, logout } from '@redux/slices/authSlice';
import type { User } from '@typings/models.types';
import type { ApiResponse } from '@typings/api.types';

interface SendOtpRequest  { phone: string }
interface SendOtpResponse { message: string; expiresIn: number }

interface VerifyOtpRequest  { phone: string; otp: string }
interface VerifyOtpResponse {
  isNewUser: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

interface RegisterRequest {
  phone: string;
  colonyId: string;
  name: string;
  flatNumber: string;
  fcmToken?: string;
}
interface RegisterResponse { accessToken: string; refreshToken: string; user: User }

interface ColonyItem {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  distanceMeters?: number;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    sendOtp: build.mutation<ApiResponse<SendOtpResponse>, SendOtpRequest>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),

    verifyOtp: build.mutation<ApiResponse<VerifyOtpResponse>, VerifyOtpRequest>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { isNewUser, accessToken, refreshToken, user } = data.data;
          if (!isNewUser && accessToken && refreshToken && user) {
            dispatch(setCredentials({ user, accessToken, refreshToken }));
          }
        } catch { /* handled in component */ }
      },
    }),

    register: build.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, refreshToken, user } = data.data;
          dispatch(setCredentials({ user, accessToken, refreshToken }));
        } catch { /* handled in component */ }
      },
    }),

    getColonies: build.query<ApiResponse<ColonyItem[]>, { lat?: number; lng?: number }>({
      query: ({ lat, lng }) => ({
        url: '/auth/colonies',
        params: lat && lng ? { lat, lng } : undefined,
      }),
    }),

    logoutUser: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // Logout immediately on client regardless of server response
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
        try { await queryFulfilled; } catch { /* already logged out */ }
      },
    }),

  }),
  overrideExisting: false,
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useGetColoniesQuery,
  useLogoutUserMutation,
} = authApi;
