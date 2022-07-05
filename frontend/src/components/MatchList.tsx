import React from 'react'

import { groupMatchesByDay } from '../matches/matchUtils'
import { useLatestMatchesQuery } from '../matches/matchesApi'

import * as styles from './MatchList.module.scss'
import MatchRow from './MatchRow'

export default React.memo(function MatchList() {
  const { data, isLoading, isError } = useLatestMatchesQuery()
  if (isLoading) return <div>Loading...</div>
  if (isError || !data) return <div>Error loading matches</div>

  return (
    <>
      {groupMatchesByDay(data).map((matchDay) => {
        const date =
          matchDay.date === undefined ? 'Not played yet' : matchDay.date
        return (
          <div key={date}>
            <div className={styles.date}>{date}</div>
            {matchDay.matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        )
      })}
    </>
  )
})
