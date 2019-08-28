import { Atom } from '@grammarly/focal'
import { SavedMatch } from '../common/types'
import * as api from './api'

export async function deleteMatch(
  latestMatches: Atom<SavedMatch[]>,
  id: number
) {
  if (api.deleteMatch(id)) {
    latestMatches.modify(matches => matches.filter(match => match.id !== id))
  }
}

export async function createRandomMatchPair(
  latestMatches: Atom<SavedMatch[]>,
  userIds: [number, number]
) {
  return api
    .addRandomMatchPair(userIds)
    .then(newPair => latestMatches.modify(prev => [...newPair, ...prev]))
}
