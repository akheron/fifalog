import * as R from 'ramda'
import * as pg from 'pg'
import { Middleware } from 'typera-koa'

import { League, Match, User } from '../../common/types'
import { MatchResultBody } from '../../common/types'
import config from './config'
import { onIntegrityError } from './db-utils'
import * as sql from './sql'

type MonthUserStats = {
  month: string
  user: User
  wins: number
  overTimeWins: number
  goalsFor: number
}

type TotalStats = {
  month: string
  matches: number
  ties: number
  goals: number
}

export type DBClient = ReturnType<typeof dbClient>

const dbClient = (client: pg.ClientBase) => ({
  async users(): Promise<User[]> {
    return sql.users(client)
  },

  async leagues(): Promise<League[]> {
    const rows = await sql.leagues(client, { matchPairsToExclude: 5 })
    return R.groupWith((a, b) => a.league_name === b.league_name, rows).map(
      rows => ({
        id: rows[0].league_id,
        name: rows[0].league_name,
        teams: rows.map(row => ({
          id: row.team_id,
          name: row.team_name,
        })),
      })
    )
  },

  /**
   * null -> no such match
   */
  async match(id: number): Promise<Match | null> {
    const row = await sql.match(client, { matchId: id })
    return row && matchFromRow(row)
  },

  /**
   *  true -> was actually removed
   */
  async deleteMatch(id: number): Promise<boolean> {
    return (await sql.deleteMatch(client, { matchId: id })) === 1
  },

  /**
   * null -> no such match
   */
  async finishMatch(
    id: number,
    result: MatchResultBody
  ): Promise<Match | null> {
    const rowCount = await sql.finishMatch(client, {
      matchId: id,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      finishedType: result.finishedType.kind,
      homePenaltyGoals: MatchResultBody.isPenalties(result.finishedType)
        ? result.finishedType.homeGoals
        : null,
      awayPenaltyGoals: MatchResultBody.isPenalties(result.finishedType)
        ? result.finishedType.awayGoals
        : null,
    })

    if (rowCount == 0) return null
    return await this.match(id)
  },

  async latestMatches(count: number): Promise<Match[]> {
    const rows = await sql.latestMatches(client, { limit: count })
    return rows.map(matchFromRow)
  },

  async createMatch(params: {
    leagueId: number | null
    homeId: number
    awayId: number
    homeUserId: number
    awayUserId: number
  }): Promise<Match | null> {
    let result = await onIntegrityError(null, sql.createMatch(client, params))
    if (result == null) return null
    return await this.match(result.id)
  },

  async userStats(limit: number | null): Promise<MonthUserStats[]> {
    const rows = await sql.userStats(client, {
      limit: limit === null ? 0 : limit,
    })
    return rows.map(r => ({
      month: r.month,
      user: {
        id: r.user_id,
        name: r.user_name,
      },
      wins: r.win_count,
      overTimeWins: r.overtime_win_count,
      goalsFor: r.goals_for,
    }))
  },

  async totalStats(limit: number | null): Promise<TotalStats[]> {
    const rows = await sql.totalStats(client, {
      limit: limit === null ? 0 : limit,
    })
    return rows.map(r => ({
      month: r.month,
      matches: r.match_count,
      ties: r.tie_count,
      goals: r.goal_count,
    }))
  },
})

const forceSslOptions = {
  rejectUnauthorized: false,
}

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseForceSsl ? forceSslOptions : undefined,
})

export const db: Middleware.Middleware<{ db: DBClient }, never> = async () => {
  try {
    const connection = await pool.connect()
    return Middleware.next({ db: dbClient(connection) }, () =>
      connection.release()
    )
  } catch (err) {
    console.error('Unable to connect to database')
    throw err
  }
}

// Helpers

type UnPromise<P extends Promise<any>> = P extends Promise<infer T> ? T : never
type MatchRow = Exclude<UnPromise<ReturnType<typeof sql.match>>, null>

function matchFromRow(r: MatchRow): Match {
  return {
    id: r.match_id,
    leagueId: r.league_id,
    leagueName: r.league_name,
    home: { id: r.home_id, name: r.home_name },
    away: { id: r.away_id, name: r.away_name },
    homeUser: { id: r.home_user_id, name: r.home_user_name },
    awayUser: { id: r.away_user_id, name: r.away_user_name },
    result:
      r.finished_type && r.finished_date
        ? {
            finishedDate: r.finished_date,
            homeScore: r.home_score!,
            awayScore: r.away_score!,
            finishedType:
              r.finished_type === 'fullTime'
                ? { kind: 'fullTime' }
                : r.finished_type === 'overTime'
                ? { kind: 'overTime' }
                : {
                    kind: 'penalties',
                    homeGoals: r.home_penalty_goals!,
                    awayGoals: r.away_penalty_goals!,
                  },
          }
        : null,
  }
}
