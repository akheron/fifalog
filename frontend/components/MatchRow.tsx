import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { MatchResult, Stats } from '../../common/types'
import { finishMatch } from '../mutations'
import { State } from '../state'
import { requireAtom } from '../utils'
import MatchRowButtons from './MatchRowButtons'
import EditMatch from './EditMatch'
import * as styles from './MatchRow.scss'

const MatchRow = (props: {
  row: Atom<State.MatchRow>
  stats: Atom<Stats[]>
  onRemove: () => {}
}) => (
  <F.Fragment>
    {props.row.view(row => {
      const { home, away, homeUser, awayUser, result } = row.match

      return (
        <div className={styles.match}>
          <div className={styles.matchInfo}>
            <strong>{home.name}</strong> (
            {hiliteWinner(result, 'home', homeUser.name)}) -{' '}
            <strong>{away.name}</strong> (
            {hiliteWinner(result, 'away', awayUser.name)})
          </div>
          {result != null && (
            <div className={styles.result}>
              <strong>{result.homeScore}</strong> -{' '}
              <strong>{result.awayScore}</strong>
              {finishedTypeString(result.finishedType)}
            </div>
          )}
          {result == null && (
            <F.Fragment>
              <MatchRowButtons
                edit={props.row.lens('edit')}
                onRemove={props.onRemove}
              />
              {requireAtom(props.row.lens('edit'), null, edit => (
                <EditMatch
                  key="edit"
                  edit={edit}
                  onSave={result => finishMatch(props.stats, props.row, result)}
                />
              ))}
            </F.Fragment>
          )}
        </div>
      )
    })}
  </F.Fragment>
)

export default MatchRow

const hiliteWinner = (
  result: MatchResult | null,
  which: 'home' | 'away',
  text: string
) => {
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
}

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
