import { combine } from 'baconjs'
import { Atom, Fragment, h } from 'harmaja'
import { MatchResult, Stats, User } from '../../../common/types'
import { definedOr } from '../atom-utils'
import { finishMatch } from '../mutations'
import { State } from '../state'
import MatchRowButtons from './MatchRowButtons'
import EditMatch from './EditMatch'
import * as styles from './MatchRow.scss'

const MatchRow = (props: {
  row: Atom<State.MatchRow>
  rows: Atom<State.MatchRow[]>
  stats: Atom<Stats[]>
  onRemove: () => {}
}) => {
  const match = props.row.view('match')
  const home = match.view('home')
  const away = match.view('away')
  const homeUser = match.view('homeUser')
  const awayUser = match.view('awayUser')
  const result = match.view('result')
  const edit = props.row.view('edit')

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
            <MatchRowButtons edit={edit} onRemove={props.onRemove} />
            {definedOr(
              edit,
              e => (
                <EditMatch
                  edit={e}
                  onSave={result =>
                    finishMatch(props.stats, props.row, props.rows, result)
                  }
                />
              ),
              () => null
            )}
          </>
        )
      )}
    </div>
  )
}

export default MatchRow

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
