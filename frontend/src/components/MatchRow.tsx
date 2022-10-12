import React, { useCallback } from 'react'

import {
  FinishedType,
  Match,
  MatchResult,
  useDeleteMatchMutation,
  useMatchTeamStatsQuery,
} from '../matches/matchesApi'
import { useBooleanState } from '../utils/state'

import EditMatch from './EditMatch'
import * as styles from './MatchRow.module.css'
import { HGap, VGap } from './whitespace'

export interface Props {
  match: Match
}

export default React.memo(function MatchRow({ match }: Props) {
  const stats = useBooleanState(false)
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
          <VGap />
          {editing.value ? (
            <EditMatch id={match.id} onCancel={editing.off} />
          ) : (
            <div className={styles.buttons}>
              <button disabled={isDeleting} onClick={stats.toggle}>
                stats {stats.value ? '△' : '▽'}
              </button>
              <HGap />
              <button disabled={isDeleting} onClick={editing.on}>
                edit
              </button>
              <HGap />
              <button disabled={isDeleting} onClick={handleDelete}>
                x
              </button>
            </div>
          )}
        </>
      ) : null}
      {stats.value ? <MatchStats matchId={match.id} /> : null}
    </div>
  )
})

const MatchStats = React.memo(function MatchStats({
  matchId,
}: {
  matchId: number
}) {
  const { data: stats, isLoading, isError } = useMatchTeamStatsQuery(matchId)
  return (
    <div className={styles.stats}>
      <VGap />
      {isLoading ? <div style={{ textAlign: 'center' }}>Loading...</div> : null}
      {isError ? (
        <div style={{ textAlign: 'center' }}>Error loading stats</div>
      ) : null}
      {stats ? (
        <>
          <div className={styles.row}>
            <div>
              {stats.home.pair ? (
                <>
                  <span className={styles.dimmed}>
                    {stats.home.pair.wins}/{stats.home.pair.matches}
                  </span>{' '}
                  {percentage(stats.home.pair.wins, stats.home.pair.matches)}
                </>
              ) : (
                '-'
              )}
            </div>
            <div>
              <strong>pair</strong>
            </div>
            <div>
              {stats.away.pair ? (
                <>
                  {percentage(stats.away.pair.wins, stats.away.pair.matches)}{' '}
                  <span className={styles.dimmed}>
                    {stats.away.pair.wins}/{stats.away.pair.matches}
                  </span>
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className={styles.row}>
            <div>
              {stats.home.total ? (
                <>
                  <span className={styles.dimmed}>
                    {stats.home.total.wins}/{stats.home.total.matches}
                  </span>{' '}
                  {percentage(stats.home.total.wins, stats.home.total.matches)}
                </>
              ) : (
                '-'
              )}
            </div>
            <div>
              <strong>total</strong>
            </div>
            <div>
              {stats.away.total ? (
                <>
                  {percentage(stats.away.total.wins, stats.away.total.matches)}{' '}
                  <span className={styles.dimmed}>
                    {stats.away.total.wins}/{stats.away.total.matches}
                  </span>
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className={styles.row}>
            <div>
              {stats.home.total
                ? round(stats.home.total.goalsFor / stats.home.total.matches)
                : '-'}
            </div>
            <div>
              <strong>gf</strong>
            </div>
            <div>
              {stats.away.total
                ? round(stats.away.total.goalsFor / stats.away.total.matches)
                : '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div>
              {stats.home.total
                ? round(
                    stats.home.total.goalsAgainst / stats.home.total.matches
                  )
                : '-'}
            </div>
            <div>
              <strong>ga</strong>
            </div>
            <div>
              {stats.away.total
                ? round(
                    stats.away.total.goalsAgainst / stats.away.total.matches
                  )
                : '-'}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
})

function percentage(numerator: number, denominator: number): string {
  return `${Math.round((numerator / denominator) * 100)} %`
}

function round(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

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
