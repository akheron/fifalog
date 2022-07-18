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
      <div>
        <strong>{match.home.name}</strong> (
        <HighlightWinner match={match} which="home" />){' - '}
        <strong>{match.away.name}</strong> (
        <HighlightWinner match={match} which="away" />)
      </div>
      {match.result !== null ? (
        <div className={styles.result}>
          <strong>{match.result.homeScore}</strong> -{' '}
          <strong>{match.result.awayScore}</strong>
          <MatchEndResult finishedType={match.result.finishedType} />
        </div>
      ) : (
        <>
          <MatchRowButtons
            isEditing={editing.value}
            isLoading={isDeleting}
            onEdit={editing.on}
            onDelete={handleDelete}
            onCancel={editing.off}
          />
          {editing.value ? <EditMatch id={match.id} /> : null}
        </>
      )}
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
  return isWinner(match.result, which) ? (
    <em className={styles.winner}>{userName}</em>
  ) : (
    <>{userName}</>
  )
})

const MatchEndResult = React.memo(function MatchEndResult({
  finishedType,
}: {
  finishedType: FinishedType
}) {
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
})
