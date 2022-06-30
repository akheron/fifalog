import { User } from '../users/usersApi'
import { api } from '../api'

export interface MatchDay {
  date: string | undefined
  matches: Match[]
}

export interface Match {
  id: number
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

export interface MatchResult {
  finishedDate: string
  homeScore: number
  awayScore: number
  finishedType: MatchResult.FinishedType
}

export namespace MatchResult {
  export type FullTime = { kind: 'fullTime' }
  export type OverTime = { kind: 'overTime' }
  export type Penalties<T> = {
    kind: 'penalties'
    homeGoals: T
    awayGoals: T
  }
  export type FinishedType = FullTime | OverTime | Penalties<number>
}

export interface MatchResultBody {
  homeScore: number
  awayScore: number
  finishedType: MatchResult.FinishedType
}

export const matchesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    latestMatches: builder.query<Match[], void>({
      query: () => '/api/matches',
      providesTags: (result) =>
        result
          ? [
              ...result.map((match) => ({
                type: 'Matches' as const,
                id: match.id,
              })),
              { type: 'Matches', id: 'LIST' },
            ]
          : [{ type: 'Matches', id: 'LIST' }],
    }),
    deleteMatch: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/matches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Matches', id }],
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
      invalidatesTags: (result, _error, body) =>
        result ? [{ type: 'Matches', id: 'LIST' }] : [],
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
        { type: 'Stats', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useLatestMatchesQuery,
  useDeleteMatchMutation,
  useCreateRandomMatchPairMutation,
  useFinishMatchMutation,
} = matchesApi
