import { Atom } from '@grammarly/focal'
import { MatchResultBody } from '../common/types'
import * as api from './api'
import { State } from './state'

export async function deleteMatch(rows: Atom<State.MatchRow[]>, id: number) {
  if (api.deleteMatch(id)) {
    rows.modify(rows => rows.filter(row => row.match.id !== id))
  }
}

export async function createRandomMatchPair(
  rows: Atom<State.MatchRow[]>,
  userIds: [number, number]
) {
  return api
    .addRandomMatchPair(userIds)
    .then(newPair =>
      rows.modify(prev => [...newPair.map(State.rowFromMatch), ...prev])
    )
}

export async function finishMatch(
  row: Atom<State.MatchRow>,
  result: MatchResultBody
) {
  return api.finishMatch(row.get().match.id, result).then(match => {
    row.set({ match: match, edit: null })
  })
}
