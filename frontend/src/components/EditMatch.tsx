import { either } from 'fp-ts'
import { pipe } from 'fp-ts/es6/pipeable'
import { Atom, Lens, h } from 'harmaja'
import {
  MatchResult as BackendMatchResult,
  MatchResultBody,
} from '../../../common/types'
import { matchResultBodyS } from '../../../common/codecs'
import { EditMatch } from '../state'
import { match } from '../atom-utils'
import Input from './Input'
import * as styles from './EditMatch.scss'

type FinishedType = 'fullTime' | 'overTime' | 'penalties'

const finishedTypeLens: Lens<
  BackendMatchResult.FinishedTypeString,
  FinishedType
> = {
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
): Lens<BackendMatchResult.Penalties<string>, string> => ({
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

const convertEdit = (edit: EditMatch): MatchResultBody | null =>
  pipe<any, MatchResultBody | null>(
    matchResultBodyS.decode(edit),
    either.getOrElse(() => null)
  )

const EditMatch = (props: {
  edit: Atom<Exclude<EditMatch, null>>
  onSave: (result: MatchResultBody) => void
}) => {
  const homeScore = props.edit.view('homeScore')
  const awayScore = props.edit.view('awayScore')
  const finishedType = props.edit.view('finishedType')

  return (
    <div className={styles.editMatch}>
      <Input type="text" value={homeScore} />
      {' - '}
      <Input type="text" value={awayScore} />{' '}
      <FinishedTypeSelect value={finishedType.view(finishedTypeLens)} />
      {match(
        finishedType,
        (f): f is BackendMatchResult.Penalties<string> =>
          f.kind === 'penalties',
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
        disabled={props.edit.map(e => !convertEdit(e))}
        onClick={() => {
          const result = convertEdit(props.edit.get())
          if (result) props.onSave(result)
        }}
      >
        save
      </button>
    </div>
  )
}

export default EditMatch

const FinishedTypeSelect = (props: { value: Atom<FinishedType> }) => (
  <select
    onChange={e => props.value.set(e.currentTarget.value as FinishedType)}
  >
    <option value="fullTime">full time</option>
    <option value="overTime">overtime</option>
    <option value="penalties">penalties</option>
  </select>
)
