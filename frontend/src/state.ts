import { Match, MatchResult, User, Stats } from '../../common/types'

export type State = LoggedOut | LoggedIn

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

export type LoggedInState =
  | {
      users: User[]
      stats: Stats[]
      matches: MatchRow[]
    }
  | undefined

export type MatchRow = {
  match: Match
  edit: EditMatch
}

export type EditMatch = {
  homeScore: string
  awayScore: string
  finishedType: MatchResult.FinishedTypeString
} | null

export const rowFromMatch = (match: Match): MatchRow => ({
  match,
  edit: null,
})

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
      matches: matches.map(rowFromMatch),
    },
  }
}
