import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { Team } from '../types'
import * as styles from './SelectedTeams.scss'

type Props = { teams: Atom<[Team, Team] | null> }

const SelectedTeams = ({ teams }: Props) => (
  <F.div className={styles.selectedTeams}>
    {teams.view(t => {
      if (!t) return null

      const [home, away] = t
      return (
        <>
          <div>
            <span className={styles.heading}>Home</span>
            <span>{home}</span>
          </div>
          <div>
            <span className={styles.heading}>Away</span>
            <span>{away}</span>
          </div>
        </>
      )
    })}
  </F.div>
)

export default SelectedTeams
