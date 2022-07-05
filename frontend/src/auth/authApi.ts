import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { api } from '../api'

export interface Credentials {
  username: string
  password: string
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    authStatus: builder.query<boolean, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery('/auth/status')
        const status = result.meta?.response?.status
        if (status === 200) return { data: true }
        if (status === 401) return { data: false }
        return { error: result.error as FetchBaseQueryError }
      },
    }),
    login: builder.mutation<void, Credentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(
          authApi.util.updateQueryData('authStatus', undefined, () => true)
        )
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'GET' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(api.util.resetApiState())
      },
    }),
  }),
})

export const { useAuthStatusQuery, useLoginMutation, useLogoutMutation } =
  authApi
