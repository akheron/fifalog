import * as React from 'react'
import { SavedMatch, MatchResult } from '../../common/types'
import * as styles from './Match.scss'

const hiliteWinner = (
  result: MatchResult | null,
  which: 'home' | 'away',
  text: string
) => {
  const winner =
    result && (result.homeScore > result.awayScore ? 'home' : 'away')
  if (winner === which) return <em>{text}</em>
  return text
}

const finishedTypeString = (finishedType: MatchResult.FinishedType) => {
  switch (finishedType.kind) {
    case 'fullTime':
      return null
    case 'extraTime':
      return <small className={styles.finishedType}>(ET)</small>
    case 'penalties': {
      const { homeGoals, awayGoals } = finishedType
      return (
        <small className={styles.finishedType}>
          (PEN {homeGoals} - {awayGoals})
        </small>
      )
    }
  }
}

const Match = (props: { match: SavedMatch; onRemove: () => {} }) => {
  const { home, away, homeUser, awayUser, result } = props.match
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
        <div>
          <button onClick={props.onRemove}>x</button>
        </div>
      )}
    </div>
  )
}

export default Match
