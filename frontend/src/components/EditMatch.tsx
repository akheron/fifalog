import { either } from 'fp-ts'
import { pipe } from 'fp-ts/es6/pipeable'
import { Atom, Lens, atom, h } from 'harmaja'
import { MatchResult, MatchResultBody } from '../../../common/types'
import { matchResultBodyS } from '../../../common/codecs'
import { match } from '../atom-utils'
import Input from './Input'
import * as styles from './EditMatch.scss'

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
  onSave: (result: MatchResultBody) => void
}

export default ({ onSave }: Props) => {
  const state = atom<State>({
    homeScore: '',
    awayScore: '',
    finishedType: { kind: 'fullTime' },
  })

  const homeScore = state.view('homeScore')
  const awayScore = state.view('awayScore')
  const finishedType = state.view('finishedType')

  return (
    <div className={styles.editMatch}>
      <Input type="text" value={homeScore} />
      {' - '}
      <Input type="text" value={awayScore} />{' '}
      <FinishedTypeSelect value={finishedType.view(finishedTypeLens)} />
      {match(
        finishedType,
        (f): f is MatchResult.Penalties<string> => f.kind === 'penalties',
        f => (
          <small>
            {' ('}
            <Input type="text" value={f.view(penaltiesLens('homeGoals'))} />
            {' - '}
            <Input type="text" value={f.view(penaltiesLens('awayGoals'))} />
            {' P)'}
          </small>
        ),
        () => null
      )}{' '}
      <button
        disabled={state.map(s => !convertEdit(s))}
        onClick={() => {
          const result = convertEdit(state.get())
          if (result) onSave(result)
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
