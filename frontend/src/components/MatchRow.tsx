import { combine } from 'baconjs'
import { Atom, Fragment, atom, h } from 'harmaja'
import { Match, MatchResult, MatchResultBody } from '../../../common/types'
import { definedOr, ifElse } from '../atom-utils'
import { Status } from '../status'
import MatchRowButtons from './MatchRowButtons'
import EditMatch from './EditMatch'
import * as styles from './MatchRow.scss'

export interface State extends Match {
  status: Status
}

export function initialState(match: Match): State {
  return { ...match, status: 'idle' }
}

const hiliteWinner = (
  result: Atom<MatchResult | null>,
  which: 'home' | 'away',
  text: Atom<string>
) =>
  combine(result, text, (result, text) => {
    const winner =
      !result ||
      result.homeScore == result.awayScore ||
      result.finishedType.kind == 'penalties'
        ? null
        : result.homeScore > result.awayScore
        ? 'home'
        : 'away'
    if (winner === which) return <em>{text}</em>
    return text
  })

const finishedTypeString = (finishedType: MatchResult.FinishedType) => {
  switch (finishedType.kind) {
    case 'fullTime':
      return null
    case 'overTime':
      return <div className={styles.small}>(OT)</div>
    case 'penalties': {
      const { homeGoals, awayGoals } = finishedType
      return (
        <div className={styles.small}>
          ({homeGoals} - {awayGoals} P)
        </div>
      )
    }
  }
}

export type Props = {
  match: Atom<State>
  onFinish: (result: MatchResultBody) => void
  onDelete: () => void
}

export default ({ match, onFinish, onDelete }: Props) => {
  const state = atom({ editing: false })
  const editing = state.view('editing')
  const edit = () => editing.set(true)
  const cancel = () => editing.set(false)

  const home = match.view('home')
  const away = match.view('away')
  const homeUser = match.view('homeUser')
  const awayUser = match.view('awayUser')
  const result = match.view('result')

  const loading = match.view('status').map(status => status === 'loading')

  return (
    <div className={styles.match}>
      <div className={styles.matchInfo}>
        <strong>{home.view('name')}</strong> (
        {hiliteWinner(result, 'home', homeUser.view('name'))}) -{' '}
        <strong>{away.view('name')}</strong> (
        {hiliteWinner(result, 'away', awayUser.view('name'))})
      </div>
      {definedOr(
        result,
        r => (
          <div className={styles.result}>
            <strong>{r.view('homeScore')}</strong> -{' '}
            <strong>{r.view('awayScore')}</strong>
            {r.view('finishedType').map(finishedTypeString)}
          </div>
        ),
        () => (
          <>
            <MatchRowButtons
              editing={state.view('editing')}
              disabled={loading}
              onEdit={edit}
              onCancel={cancel}
              onDelete={onDelete}
            />
            {ifElse(
              editing,
              () => (
                <EditMatch disabled={loading} onSave={onFinish} />
              ),
              () => null
            )}
          </>
        )
      )}
    </div>
  )
}
