import { League, Match } from '../common/types'

export type State = {
  leagues: League[] | null
  randomMatch: Match | null
}

export const initialState: State = {
  leagues: null,
  randomMatch: null,
}
