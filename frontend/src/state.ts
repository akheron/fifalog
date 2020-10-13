import { Match, MatchResult, User, Stats } from '../../common/types'

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

