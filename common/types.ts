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
  leagueId: number
  leagueName: string
  home: Team
  away: Team
}

export type FinishedMatch = Match & {
  id: number
  timestamp: number
}
