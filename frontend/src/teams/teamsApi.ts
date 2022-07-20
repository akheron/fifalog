import { api } from '../api'

export interface League {
  id: number
  name: string
  excludeRandomAll: boolean
  teams: Team[]
}

export interface Team {
  id: number
  name: string
  disabled: boolean
  matchCount: number
}

export interface LeagueUpdate {
  id: number
  name: string
  excludeRandomAll: boolean
}

export interface TeamCreate {
  name: string
  leagueId: number
  disabled: boolean
}

export interface TeamUpdate {
  id: number
  name?: string
  leagueId?: number
  disabled?: boolean
}

export const teamsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    leagues: builder.query<League[], void>({
      query: () => '/api/leagues',
      providesTags: [{ type: 'Leagues', id: 'LIST' }],
    }),
    updateLeague: builder.mutation<void, LeagueUpdate>({
      query: (update) => {
        const { id, ...body } = update
        return {
          url: `/api/leagues/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }],
    }),
    createTeam: builder.mutation<void, TeamCreate>({
      query: (body) => ({
        url: `/api/teams`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }],
    }),
    patchTeam: builder.mutation<void, TeamUpdate>({
      query: (update) => {
        const { id, ...body } = update
        return {
          url: `/api/teams/${id}`,
          method: 'PATCH',
          body,
        }
      },
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }],
    }),
    deleteTeam: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }],
    }),
  }),
})

export const {
  useLeaguesQuery,
  useUpdateLeagueMutation,
  useCreateTeamMutation,
  usePatchTeamMutation,
  useDeleteTeamMutation,
} = teamsApi
