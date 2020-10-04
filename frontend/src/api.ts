import { Match, User, Stats } from '../../common/types'
import { MatchResultBody } from '../../common/types'

export async function login(
  username: string,
  password: string
): Promise<boolean> {
  return fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(response => response.status === 200)
}

export async function logout(): Promise<void> {
  await fetch('/auth/logout')
}

export async function initialData() {
  const [users_, matches_, stats_] = await Promise.all([
    users(),
    latestMatches(),
    stats(),
  ])
  return { users: users_, matches: matches_, stats: stats_ }
}
export async function users(): Promise<User[]> {
  const response = await fetch('/api/users')
  return response.json()
}

export async function latestMatches(): Promise<Match[]> {
  const response = await fetch('/api/matches')
  return response.json()
}

export async function deleteMatch(id: number): Promise<boolean> {
  try {
    await fetch(`/api/matches/${id}`, { method: 'DELETE' })
  } catch (err) {
    return false
  }
  return true
}

export async function addRandomMatchPair(
  userIds: [number, number]
): Promise<[Match, Match]> {
  const response = await fetch('/api/matches/random_pair', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  })
  return response.json()
}

export async function finishMatch(
  id: number,
  matchResult: MatchResultBody
): Promise<Match> {
  const response = await fetch(`/api/matches/${id}/finish`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(matchResult),
  })
  return response.json()
}

export async function stats(): Promise<Stats[]> {
  const response = await fetch('/api/stats')
  return response.json()
}
