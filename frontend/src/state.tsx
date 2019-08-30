import { Option } from '@grammarly/focal'
import { Match, MatchResult, User, Stats } from '../../common/types'

export type State = Option<{
  users: User[]
  stats: Stats[]
  matches: State.MatchRow[]
  create: Option<State.Create>
}>

export namespace State {
  export type Create = {
    user1: number
    user2: number
  }

  export type MatchRow = {
    match: Match
    edit: EditMatch
  }

  export type EditMatch = {
    homeScore: string
    awayScore: string
    finishedType: MatchResult.FinishedTypeString
  } | null

  export const rowFromMatch = (match: Match): State.MatchRow => ({
    match,
    edit: null,
  })
}

export function initialState(
  users: User[],
  matches: Match[],
  stats: Stats[]
): State {
  return {
    users,
    stats,
    matches: matches.map(State.rowFromMatch),
    create: initCreate(users),
  }
}

// Helpers

function initCreate(users: User[]): Option<State.Create> {
  if (users.length >= 2) {
    return { user1: users[0].id, user2: users[1].id }
  }
  return undefined
}
