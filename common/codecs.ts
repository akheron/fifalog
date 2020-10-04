import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

export const fullTime = t.type({ kind: t.literal('fullTime') })
export const overTime = t.type({ kind: t.literal('overTime') })
export const penalties = t.type({
  kind: t.literal('penalties'),
  homeGoals: t.Int,
  awayGoals: t.Int,
})
export const penaltiesS = t.type({
  kind: t.literal('penalties'),
  homeGoals: IntFromString,
  awayGoals: IntFromString,
})

export const matchResultBody = t.type({
  homeScore: t.Int,
  awayScore: t.Int,
  finishedType: t.union([fullTime, overTime, penalties]),
})

export const matchResultBodyS = t.type({
  homeScore: IntFromString,
  awayScore: IntFromString,
  finishedType: t.union([fullTime, overTime, penaltiesS]),
})
