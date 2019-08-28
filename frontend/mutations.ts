import { Atom } from '@grammarly/focal'
import { Match } from '../common/types'
import * as api from './api'

export async function deleteMatch(latestMatches: Atom<Match[]>, id: number) {
  if (api.deleteMatch(id)) {
    latestMatches.modify(matches => matches.filter(match => match.id !== id))
  }
}

export async function createRandomMatchPair(
  latestMatches: Atom<Match[]>,
  userIds: [number, number]
) {
  return api
    .addRandomMatchPair(userIds)
    .then(newPair => latestMatches.modify(prev => [...newPair, ...prev]))
}
