import { Atom } from 'harmaja'
import { MatchResultBody, Stats } from '../../common/types'
import * as api from './api'
import { State, loggedIn, loggedOut } from './state'

export async function login(
  state: Atom<State>,
  username: string,
  password: string
) {
  state.set(loggedOut(username, password, 'loading'))
  if (await api.login(username, password)) {
    Promise.all([
      api.users(),
      api.latestMatches(),
      api.stats(),
    ]).then(([users, matches, stats]) =>
      state.set(loggedIn(users, matches, stats))
    )
  } else {
    state.set(loggedOut(username, password, 'invalid'))
  }
}

export async function logout(state: Atom<State>) {
  await api.logout()
  state.set(loggedOut())
}

export async function deleteMatch(rows: Atom<State.MatchRow[]>, id: number) {
  if (await api.deleteMatch(id)) {
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
  stats: Atom<Stats[]>,
  row: Atom<State.MatchRow>,
  rows: Atom<State.MatchRow[]>,
  result: MatchResultBody
) {
  return api
    .finishMatch(row.get().match.id, result)
    .then(() => api.latestMatches())
    .then(matches => api.stats().then(newStats => ({ matches, newStats })))
    .then(({ matches, newStats }) => {
      rows.set(matches.map(State.rowFromMatch))
      stats.set(newStats)
    })
}
