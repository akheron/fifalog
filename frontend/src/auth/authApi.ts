import { api } from '../api'

export interface Credentials {
  username: string
  password: string
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<void, Credentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
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

export const { useLoginMutation, useLogoutMutation } = authApi
