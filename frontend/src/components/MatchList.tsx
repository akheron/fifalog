import classNames from 'classnames'
import React, { useCallback, useRef, useState } from 'react'

import { groupMatchesByDay } from '../matches/matchUtils'
import { useMatchesQuery } from '../matches/matchesApi'

import * as styles from './MatchList.module.css'
import MatchRow from './MatchRow'
import Pagination from './Pagination'

export default React.memo(function MatchList() {
  const [page, setPage] = useState(1)

  const {
    data: matches,
    isLoading,
    isFetching,
    isError,
  } = useMatchesQuery({ page, pageSize: 20 })
  const matchListRef = useRef<HTMLDivElement>(null)

  const setPageAndScroll = useCallback((p: number) => {
    setPage(p)
    matchListRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (isError || !matches) return <div>Error loading matches</div>

  return (
    <div className={styles.matchList} ref={matchListRef}>
      {isFetching ? <div className={styles.loadingOverlay} /> : null}
      {groupMatchesByDay(matches.data).map((matchDay, index) => {
        const date =
          matchDay.date === undefined ? 'Not played yet' : matchDay.date
        return (
          <div key={date}>
            <div
              className={classNames(styles.date, {
                [styles.first]: index === 0,
              })}
            >
              {date}
            </div>
            {matchDay.matches.map((match) => (
              <>
                <MatchRow key={match.id} match={match} />
                {match.index === matches.last10 ? (
                  <div className={styles.last10} />
                ) : null}
              </>
            ))}
          </div>
        )
      })}
      <div className={styles.pagination}>
        <Pagination
          page={page}
          setPage={setPageAndScroll}
          pageSize={20}
          total={matches.total}
        />
      </div>
    </div>
  )
})
