import { Option } from '@grammarly/focal'
import { Match, User } from '../common/types'

export type CreateRandomMatchPairState = {
  user1: number
  user2: number
}

export type State = Option<{
  users: User[]
  matches: Match[]
  createRandomMatchPair: Option<CreateRandomMatchPairState>
}>

export function initialState(users: User[], matches: Match[]): State {
  return {
    users,
    matches,
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
