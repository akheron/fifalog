import { Option } from '@grammarly/focal'
import { SavedMatch, User } from '../common/types'

export type CreateRandomMatchPairState = {
  user1: number
  user2: number
}

export type State = Option<{
  users: User[]
  latestMatches: SavedMatch[]
  createRandomMatchPair: Option<CreateRandomMatchPairState>
}>

export function initialState(
  users: User[],
  latestMatches: SavedMatch[]
): State {
  return {
    users,
    latestMatches,
    createRandomMatchPair: initCreateRandomMatchPair(users),
  }
}

function initCreateRandomMatchPair(
  users: User[]
): Option<CreateRandomMatchPairState> {
  if (users.length >= 2) {
    return { user1: users[0].id, user2: users[1].id }
  }
  return undefined
}
