import { Match, User, Stats } from '../../common/types'
import { MatchResultBody } from '../../common/types'
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

export async function deleteMatch(id: number): Promise<boolean> {
  return (await fetch(`/api/matches/${id}`, { method: 'DELETE' })).ok
}

export async function addRandomMatchPair(
  userIds: [number, number]
): Promise<[Match, Match]> {
  return (
    await fetch('/api/matches/random_pair', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds }),
    })
  ).json()
}

export async function finishMatch(
  id: number,
  matchResult: MatchResultBody
): Promise<Match> {
  return (
    await fetch(`/api/matches/${id}/finish`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchResult),
    })
  ).json()
}

export const stats_ = async (): Promise<Stats[]> =>
  (await fetch('/api/stats')).json()
export const stats = Effect.fromPromise(stats_)

const void3: (arg: void) => [void, void, void] = () => [
  undefined,
  undefined,
  undefined,
]

export const initialData = Effect.mapArg(
  Effect.map(
    Effect.parallel(users, latestMatches, stats),
    ([users, matches, stats]) => ({ users, matches, stats })
  ),
  void3
)
