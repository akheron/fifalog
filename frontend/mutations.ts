import { Atom } from '@grammarly/focal'
import { SavedMatch, User } from '../common/types'
import { CreateRandomMatchPairState } from './state'
import * as api from './api'

export async function fetchUsers(
  users: Atom<User[] | null>,
  createRandomMatchPair: Atom<CreateRandomMatchPairState>
) {
  return api.users().then(userArr => {
    users.set(userArr)

    const userIds = createRandomMatchPair.lens('userIds')
    if (
      (userIds.get()[0] == 0 || userIds.get()[1] == 0) &&
      userArr.length >= 2
    ) {
      userIds.set([userArr[0].id, userArr[1].id])
    }
  })
}

export async function fetchLatestMatches(
  latestMatches: Atom<SavedMatch[] | null>
) {
  return api.latestMatches().then(matches => latestMatches.set(matches))
}

export async function createRandomMatchPair(
  latestMatches: Atom<SavedMatch[] | null>,
  userIds: [number, number]
) {
  return api
    .addRandomMatchPair(userIds)
    .then(newPair =>
      latestMatches.modify(prev => (prev ? [...newPair, ...prev] : newPair))
    )
}
