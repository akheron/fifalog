import React, { useCallback } from 'react'

import {
  FinishedType,
  Match,
  MatchResult,
  useDeleteMatchMutation,
} from '../matches/matchesApi'
import { useBooleanState } from '../utils/state'

import EditMatch from './EditMatch'
import * as styles from './MatchRow.module.css'
import MatchRowButtons from './MatchRowButtons'

export interface Props {
  match: Match
}

export default React.memo(function MatchRow({ match }: Props) {
  const editing = useBooleanState(false)
  const [deleteMatch, { isLoading: isDeleting }] = useDeleteMatchMutation()

  const handleDelete = useCallback(async () => {
    if (confirm('Really?')) {
      await deleteMatch(match.id)
    }
  }, [deleteMatch, match.id])

  return (
    <div className={styles.match}>
      {match.index !== null ? (
        <div className={styles.index}>Match {match.index}</div>
      ) : null}
      <div className={styles.row}>
        <div>{match.home.name}</div>
        <div>
          <div className={styles.score}>
            {match.result !== null ? (
              <>
                <strong>{match.result.homeScore}</strong> -{' '}
                <strong>{match.result.awayScore}</strong>
              </>
            ) : (
              '-'
            )}
          </div>
        </div>
        <div>
          {match.away.name}
          <br />
        </div>
      </div>
      <div className={styles.row}>
        <HighlightWinner match={match} which="home" />
        <div className={styles.overtime}>
          {match.result !== null ? (
            <OvertimeResult finishedType={match.result.finishedType} />
          ) : null}
        </div>
        <HighlightWinner match={match} which="away" />
      </div>
      {match.result === null ? (
        <>
          {editing.value ? (
            <EditMatch id={match.id} onCancel={editing.off} />
          ) : (
            <MatchRowButtons
              isLoading={isDeleting}
              onEdit={editing.on}
              onDelete={handleDelete}
            />
          )}
        </>
      ) : null}
    </div>
  )
})

function isWinner(result: MatchResult | null, which: 'home' | 'away'): boolean {
  const winner: 'home' | 'away' | null =
    result !== null
      ? result.homeScore == result.awayScore ||
        result.finishedType.kind == 'penalties'
        ? null
        : result.homeScore > result.awayScore
        ? 'home'
        : 'away'
      : null
  return winner === which
}

const HighlightWinner = React.memo(function HighlightWinner({
  match,
  which,
}: {
  match: Match
  which: 'home' | 'away'
}) {
  const userProp =
    which === 'home' ? ('homeUser' as const) : ('awayUser' as const)
  const userName = match[userProp].name
  return (
    <div className={styles.player}>
      {isWinner(match.result, which) ? (
        <strong>{userName}</strong>
      ) : (
        <>{userName}</>
      )}
    </div>
  )
})

const OvertimeResult = React.memo(function MatchEndResult({
  finishedType,
}: {
  finishedType: FinishedType
}) {
  switch (finishedType.kind) {
    case 'fullTime':
      return null
    case 'overTime':
      return <div>OT</div>
    case 'penalties': {
      const { homeGoals, awayGoals } = finishedType
      return (
        <div>
          {homeGoals} - {awayGoals} P
        </div>
      )
    }
  }
})
