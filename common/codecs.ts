import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

export function makeMatchResultBodyCodec(inputType: 'string' | 'number') {
  const int = inputType == 'string' ? IntFromString : t.Int

  return t.type({
    homeScore: int,
    awayScore: int,
    finishedType: t.union([
      t.type({ kind: t.literal('fullTime') }),
      t.type({ kind: t.literal('overTime') }),
      t.type({
        kind: t.literal('penalties'),
        homeGoals: int,
        awayGoals: int,
      }),
    ]),
  })
}

export const matchResultBody = makeMatchResultBodyCodec('number')
