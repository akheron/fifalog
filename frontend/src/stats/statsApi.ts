import { api } from '../api'
import { User } from '../users/usersApi'

export interface MonthStats {
  month: string
  userStats: UserStats[]
  ties: number
  matches: number
  goals: number
}

export interface UserStats {
  user: User
  wins: number
  overTimeWins: number
  goalsFor: number
}

export const statsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    stats: builder.query<MonthStats[], void>({
      query: () => '/api/stats',
      providesTags: [{ type: 'Stats' as const, id: 'LIST' }],
    }),
  }),
})

export const { useStatsQuery } = statsApi
