import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { Match } from '../../common/types'
import * as styles from './RandomMatch.scss'

type Props = { match: Atom<Match | null> }

const RandomMatch = ({ match }: Props) => (
  <F.div className={styles.randomMatch}>
    {match.view(m => {
      if (!m) return null

      const { leagueName, home, away } = m
      return (
        <>
          <div>
            <span className={styles.heading}>League</span>
            <span>{leagueName}</span>
          </div>
          <div>
            <span className={styles.heading}>Home</span>
            <span>{home.name}</span>
          </div>
          <div>
            <span className={styles.heading}>Away</span>
            <span>{away.name}</span>
          </div>
        </>
      )
    })}
  </F.div>
)

export default RandomMatch
