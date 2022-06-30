import { api } from '../api'

export interface User {
  id: number
  name: string
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    users: builder.query<User[], void>({
      query: () => '/api/users',
    }),
  }),
})

export const { useUsersQuery } = usersApi
