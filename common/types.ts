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
  finishedTime: number
  homeScore: number
  awayScore: number
  finishedType: MatchResult.FinishedType
}

export namespace MatchResult {
  export type FullTime = { kind: 'fullTime' }
  export type ExtraTime = { kind: 'extraTime' }
  export type Penalties = {
    kind: 'penalties'
    homeGoals: number
    awayGoals: number
  }
  export type FinishedType = FullTime | ExtraTime | Penalties
}

export type User = {
  id: number
  name: string
}
