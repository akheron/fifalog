import { Match, MatchDay } from './matchesApi'
import * as R from 'ramda'

function eqDate(a: Match, b: Match): boolean {
  return a.result?.finishedDate === b.result?.finishedDate
}

export function groupMatchesByDay(matches: Match[]): MatchDay[] {
  const matchesByDate = R.groupWith(eqDate, matches)
  return matchesByDate.map((day) => ({
    date: day[0].result?.finishedDate,
    matches: day,
  }))
}
