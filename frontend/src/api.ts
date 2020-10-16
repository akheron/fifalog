import { Match, User, Stats } from '../../common/types'
import { MatchResultBody } from '../../common/types'

export async function login(credentials: {
  username: string
  password: string
}): Promise<boolean> {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  return response.ok
}

export async function logout(): Promise<void> {
  await fetch('/auth/logout')
}

export async function initialData(): Promise<{
  users: User[]
  matches: Match[]
  stats: Stats[]
}> {
  const [users_, matches, stats_] = await Promise.all([
    users(),
    latestMatches(),
    stats(),
  ])
  return { users: users_, matches, stats: stats_ }
}

export async function users(): Promise<User[]> {
  return (await fetch('/api/users')).json()
}

export async function latestMatches(): Promise<Match[]> {
  return (await fetch('/api/matches')).json()
}

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

export async function stats(): Promise<Stats[]> {
  return (await fetch('/api/stats')).json()
}
