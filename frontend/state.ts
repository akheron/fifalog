import { Match, SavedMatch, User } from '../common/types'

export type CreateRandomMatchPairState = {
  userIds: [number, number]
}

export type State = {
  users: User[] | null
  latestMatches: SavedMatch[] | null
  createRandomMatchPair: CreateRandomMatchPairState
}

export const initialState: State = {
  users: null,
  latestMatches: null,
  createRandomMatchPair: {
    userIds: [0, 0],
  },
}
