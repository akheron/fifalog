import * as t from 'io-ts'
import { matchResultBody } from './codecs'

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
  finishedTime: string
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

export type User = {
  id: number
  name: string
}
