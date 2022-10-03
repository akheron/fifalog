import { api } from '../api'
import { User } from '../users/usersApi'

export interface MatchDay {
  date: string | undefined
  matches: Match[]
}

export interface Match {
  id: number
  index: number | null
  leagueId: number | null
  leagueName: string | null
  home: Team
  away: Team
  homeUser: User
  awayUser: User
  result: MatchResult | null // null -> not finished
}

export type Team = {
  id: number
  name: string
}

export type FullTime = { kind: 'fullTime' }
export type OverTime = { kind: 'overTime' }
export type Penalties<T> = {
  kind: 'penalties'
  homeGoals: T
  awayGoals: T
}
export type FinishedType = FullTime | OverTime | Penalties<number>

export interface MatchResult {
  finishedDate: string
  homeScore: number
  awayScore: number
  finishedType: FinishedType
}

export interface MatchResultBody {
  homeScore: number
  awayScore: number
  finishedType: FinishedType
}

export const matchesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    matches: builder.query<
      { data: Match[]; last10: number, total: number },
      { page: number; pageSize: number }
    >({
      query: (arg) => `/api/matches?page=${arg.page}&pageSize=${arg.pageSize}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((match) => ({
                type: 'Matches' as const,
                id: match.id,
              })),
              { type: 'Matches', id: 'PARTIAL-LIST' },
            ]
          : [{ type: 'Matches', id: 'PARTIAL-LIST' }],
    }),
    deleteMatch: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/matches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Matches', id },
        { type: 'Matches', id: 'PARTIAL-LIST' },
        { type: 'Leagues', id: 'LIST' },
      ],
    }),
    createRandomMatchPair: builder.mutation<
      [Match, Match],
      { user1: number; user2: number; respectLeagues: boolean }
    >({
      query: (body) => ({
        url: '/api/matches/random_pair',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Matches', id: 'PARTIAL-LIST' },
              { type: 'Leagues', id: 'LIST' },
            ]
          : [],
    }),
    finishMatch: builder.mutation<
      Match,
      { id: number; result: MatchResultBody }
    >({
      query: ({ id, result }) => ({
        url: `/api/matches/${id}/finish`,
        method: 'POST',
        body: result,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Matches', id },
        { type: 'Matches', id: 'PARTIAL-LIST' },
        { type: 'Stats', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useMatchesQuery,
  useDeleteMatchMutation,
  useCreateRandomMatchPairMutation,
  useFinishMatchMutation,
} = matchesApi
