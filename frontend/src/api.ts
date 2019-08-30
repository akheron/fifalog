import { Match, User, Stats } from '../../common/types'
import { MatchResultBody } from '../../common/types'

export async function users(): Promise<User[]> {
  return fetch('/api/users').then(l => l.json())
}

export async function latestMatches(): Promise<Match[]> {
  return fetch('/api/matches').then(l => l.json())
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
  return fetch('/api/matches/random_pair', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  }).then(l => l.json())
}

export async function finishMatch(
  id: number,
  matchResult: MatchResultBody
): Promise<Match> {
  return fetch(`/api/matches/${id}/finish`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(matchResult),
  }).then(l => l.json())
}

export async function stats(): Promise<Stats[]> {
  return fetch('/api/stats').then(l => l.json())
}
