import * as t from 'io-ts'
import { matchResultBody, penalties } from './codecs'

export type League = {
  id: number
  name: string
  teams: Team[]
}

export type Team = {
  id: number
  name: string
}

export type Match = {
  id: number
  leagueId: number
  leagueName: string
  home: Team
  away: Team
  homeUser: User
  awayUser: User
  result: MatchResult | null // null -> not finished
}

export type MatchResult = {
  finishedDate: string
  homeScore: number
  awayScore: number
  finishedType: MatchResult.FinishedType
}

export namespace MatchResult {
  export type FullTime = { kind: 'fullTime' }
  export type OverTime = { kind: 'overTime' }
  export type Penalties<T> = {
    kind: 'penalties'
    homeGoals: T
    awayGoals: T
  }
  export type FinishedType = FullTime | OverTime | Penalties<number>
  export type FinishedTypeString = FullTime | OverTime | Penalties<string>
}

export type MatchResultBody = t.TypeOf<typeof matchResultBody>

export namespace MatchResultBody {
  export function isPenalties(
    finishedType: MatchResultBody['finishedType']
  ): finishedType is t.TypeOf<ReturnType<typeof penalties>> {
    return finishedType.kind === 'penalties'
  }
}

export type User = {
  id: number
  name: string
}

export type Stats = {
  month: string
  userStats: Stats.UserStats[]
  ties: number
  matches: number
}

export namespace Stats {
  export type UserStats = {
    user: User
    wins: number
    overTimeWins: number
  }
}
