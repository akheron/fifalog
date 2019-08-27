import * as React from 'react'
import { SavedMatch } from '../../common/types'
import styles = require('./Match.scss')

const FutureMatch = (props: { match: SavedMatch }) => {
  const { leagueName, home, away, homeUser, awayUser } = props.match
  return (
    <div className={styles.match}>
      <div>
        <span className={styles.heading}>League</span>
        <span>{leagueName}</span>
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
    </div>
  )
}

export default FutureMatch
