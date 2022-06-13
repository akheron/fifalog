import { Match, User, Stats } from './types'
import { MatchResultBody } from './types'
import * as Effect from './effect'

export const login = Effect.fromPromise(
  async (credentials: {
    username: string
    password: string
  }): Promise<boolean> => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    return response.ok
  }
)

export const logout = Effect.fromPromise(
  async (): Promise<void> => {
    await fetch('/auth/logout')
  }
)

export const users = Effect.fromPromise(
  async (): Promise<User[]> => (await fetch('/api/users')).json()
)

export const latestMatches_ = async (): Promise<Match[]> =>
  (await fetch('/api/matches')).json()
export const latestMatches = Effect.fromPromise(latestMatches_)

export const deleteMatch = Effect.fromPromise(
  async (id: number): Promise<boolean> =>
    (await fetch(`/api/matches/${id}`, { method: 'DELETE' })).ok
)

export const createRandomMatchPair = Effect.fromPromise(
  async (arg: {
    user1: number
    user2: number
    respectLeagues: boolean
  }): Promise<[Match, Match]> =>
    (
      await fetch('/api/matches/random_pair', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(arg),
      })
    ).json()
)

export const finishMatch = Effect.fromPromise(
  async (arg: { id: number; result: MatchResultBody }): Promise<Match> =>
    (
      await fetch(`/api/matches/${arg.id}/finish`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(arg.result),
      })
    ).json()
)

export const stats_ = async (): Promise<Stats[]> =>
  (await fetch('/api/stats')).json()
export const stats = Effect.fromPromise(stats_)

const void2: (arg: void) => [void, void] = () => [undefined, undefined]

export const finishMatchAndRefresh = Effect.seq(
  Effect.pipe(
    finishMatch,
    Effect.map(() => undefined)
  ),
  Effect.pipe(
    Effect.parallel(latestMatches, stats),
    Effect.mapArg(void2),
    Effect.map(([matches, stats]) => ({ matches, stats }))
  )
)

const void3: (arg: void) => [void, void, void] = () => [
  undefined,
  undefined,
  undefined,
]

export const initialData = Effect.pipe(
  Effect.parallel(users, latestMatches, stats),
  Effect.map(([users, matches, stats]) => ({ users, matches, stats })),
  Effect.mapArg(void3)
)
