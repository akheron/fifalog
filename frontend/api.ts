import { SavedMatch, User } from '../common/types'

export async function users(): Promise<User[]> {
  return fetch('/api/users').then(l => l.json())
}

export async function latestMatches(): Promise<SavedMatch[]> {
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
): Promise<[SavedMatch, SavedMatch]> {
  return fetch('/api/matches/random_pair', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  }).then(l => l.json())
}
