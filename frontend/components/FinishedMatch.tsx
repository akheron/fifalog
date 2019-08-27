import * as React from 'react'
import { SavedMatch, MatchResult } from '../../common/types'
import * as styles from './Match.scss'

const finishedTypeString = (finishedType: MatchResult.FinishedType) => {
  switch (finishedType.kind) {
    case 'fullTime':
      return ''
    case 'extraTime':
      return '(ET)'
    case 'penalties': {
      const { homeGoals, awayGoals } = finishedType
      return `(PEN ${homeGoals}-${awayGoals})`
    }
  }
}

const FinishedMatch = (props: { match: SavedMatch; result: MatchResult }) => {
  const { leagueName, home, away, homeUser, awayUser } = props.match
  const { finishedTime, homeScore, awayScore, finishedType } = props.result
  return (
    <div className={styles.match}>
      <div>
        <span className={styles.heading}>League</span>
        <span>{leagueName}</span>
        <span>{finishedTime}</span>
      </div>
      <div>
        <span className={styles.heading}>Home</span>
        <span>{home.name}</span>
        <span>{homeUser.name}</span>
      </div>
      <div>
        <span className={styles.heading}>Away</span>
        <span>{away.name}</span>
        <span>{awayUser.name}</span>
      </div>
      <div>
        <span className={styles.heading}>Result</span>
        <span>
          {homeScore} - {awayScore} {finishedTypeString(finishedType)}
        </span>
      </div>
    </div>
  )
}

export default FinishedMatch
