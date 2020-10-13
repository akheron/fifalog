import { Atom } from 'harmaja'
import { MatchResultBody, Stats } from '../../common/types'
import * as api from './api'
import { MatchRow, rowFromMatch } from './state'

export async function deleteMatch(rows: Atom<MatchRow[]>, id: number) {
  if (await api.deleteMatch(id)) {
    rows.modify(rows => rows.filter(row => row.match.id !== id))
  }
}

export async function createRandomMatchPair(
  rows: Atom<MatchRow[]>,
  userIds: [number, number]
) {
  return api
    .addRandomMatchPair(userIds)
    .then(newPair =>
      rows.modify(prev => [...newPair.map(rowFromMatch), ...prev])
    )
}

export async function finishMatch(
  stats: Atom<Stats[]>,
  row: Atom<MatchRow>,
  rows: Atom<MatchRow[]>,
  result: MatchResultBody
) {
  return api
    .finishMatch(row.get().match.id, result)
    .then(() => api.latestMatches())
    .then(matches => api.stats().then(newStats => ({ matches, newStats })))
    .then(({ matches, newStats }) => {
      rows.set(matches.map(rowFromMatch))
      stats.set(newStats)
    })
}
