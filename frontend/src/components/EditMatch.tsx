import { either } from 'fp-ts'
import { pipe } from 'fp-ts/es6/pipeable'
import { combine } from 'baconjs'
import { Atom, Lens, atom, h } from 'harmaja/bacon'
import { MatchResult, MatchResultBody } from '../types'
import { match } from '../atom-utils'
import * as Effect from '../effect'
import Input from './Input'
import * as styles from './EditMatch.scss'
import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

const fullTime = t.type({ kind: t.literal('fullTime') })
const overTime = t.type({ kind: t.literal('overTime') })
const penaltiesS = t.type({
  kind: t.literal('penalties'),
  homeGoals: IntFromString,
  awayGoals: IntFromString,
})

const matchResultBodyS = t.type({
  homeScore: IntFromString,
  awayScore: IntFromString,
  finishedType: t.union([fullTime, overTime, penaltiesS]),
})

export type State = {
  homeScore: string
  awayScore: string
  finishedType: MatchResult.FinishedTypeString
}

type FinishedType = 'fullTime' | 'overTime' | 'penalties'

const finishedTypeLens: Lens<MatchResult.FinishedTypeString, FinishedType> = {
  get(s) {
    return s.kind
  },
  set(_, v) {
    return v === 'fullTime' || v === 'overTime'
      ? { kind: v }
      : { kind: 'penalties', homeGoals: '', awayGoals: '' }
  },
}

const penaltiesLens = (
  field: 'homeGoals' | 'awayGoals'
): Lens<MatchResult.Penalties<string>, string> => ({
  get(s) {
    return s[field]
  },
  set(s, v) {
    return {
      ...s,
      kind: 'penalties',
      [field]: v,
    }
  },
})

const convertEdit = (state: State): MatchResultBody | null =>
  pipe(
    matchResultBodyS.decode(state),
    either.getOrElse((): MatchResultBody | null => null)
  )

export type Props = {
  save: Effect.Effect<MatchResultBody>
}

export default ({ save }: Props) => {
  const state = atom<State>({
    homeScore: '',
    awayScore: '',
    finishedType: { kind: 'fullTime' },
  })

  const homeScore = state.view('homeScore')
  const awayScore = state.view('awayScore')
  const finishedType = state.view('finishedType')
  const disabled = combine(
    Effect.isPending(save),
    state.map(s => !convertEdit(s)),
    (saving, invalid) => saving || invalid
  )

  return (
    <div className={styles.editMatch}>
      <Input inputMode="numeric" value={homeScore} />
      {' - '}
      <Input inputMode="numeric" value={awayScore} />{' '}
      <FinishedTypeSelect value={finishedType.view(finishedTypeLens)} />
      {match(
        finishedType,
        (f): f is MatchResult.Penalties<string> => f.kind === 'penalties',
        f => (
          <small>
            {' ('}
            <Input inputMode="numeric" value={f.view(penaltiesLens('homeGoals'))} />
            {' - '}
            <Input inputMode="numeric" value={f.view(penaltiesLens('awayGoals'))} />
            {' P)'}
          </small>
        ),
        () => null
      )}{' '}
      <button
        disabled={disabled}
        onClick={() => {
          const result = convertEdit(state.get())
          if (result) save.run(result)
        }}
      >
        save
      </button>
    </div>
  )
}

const FinishedTypeSelect = (props: { value: Atom<FinishedType> }) => (
  <select
    onChange={e => props.value.set(e.currentTarget.value as FinishedType)}
  >
    <option value="fullTime">full time</option>
    <option value="overTime">overtime</option>
    <option value="penalties">penalties</option>
  </select>
)
