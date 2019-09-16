import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

export const fullTime = t.type({ kind: t.literal('fullTime') })
export const overTime = t.type({ kind: t.literal('overTime') })
export const penalties = (int: typeof IntFromString | typeof t.Int) =>
  t.type({
    kind: t.literal('penalties'),
    homeGoals: int,
    awayGoals: int,
  })

export function makeMatchResultBodyCodec(inputType: 'string' | 'number') {
  const int = inputType == 'string' ? IntFromString : t.Int

  return t.type({
    homeScore: int,
    awayScore: int,
    finishedType: t.union([fullTime, overTime, penalties(int)]),
  })
}

export const matchResultBody = makeMatchResultBodyCodec('number')
