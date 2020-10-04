import { Option } from '@grammarly/focal'
import { Match, MatchResult, User, Stats } from '../../common/types'

export type State = State.LoggedOut | State.LoggedIn

export namespace State {
  export type LoggedOut = {
    kind: 'LoggedOut'
    state: LoggedOutState
  }

  export type LoggedOutState = {
    username: string
    password: string
    uiState: null | 'invalid' | 'loading'
  }

  export type LoggedIn = {
    kind: 'LoggedIn'
    state: LoggedInState
  }

  export type LoggedInState = Option<{
    users: User[]
    stats: Stats[]
    matches: MatchRow[]
    create: Option<Create>
  }>

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

export function loggedOut(
  username: string = '',
  password: string = '',
  uiState: null | 'invalid' | 'loading' = null
): State {
  return {
    kind: 'LoggedOut',
    state: { username, password, uiState },
  }
}

export function loggedInLoading(): State {
  return {
    kind: 'LoggedIn',
    state: undefined,
  }
}

export function loggedIn(
  users: User[],
  matches: Match[],
  stats: Stats[]
): State {
  return {
    kind: 'LoggedIn',
    state: {
      users,
      stats,
      matches: matches.map(State.rowFromMatch),
      create: initCreate(users),
    },
  }
}

// Helpers

function initCreate(users: User[]): Option<State.Create> {
  if (users.length >= 2) {
    return { user1: users[0].id, user2: users[1].id }
  }
  return undefined
}
