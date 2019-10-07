import * as R from 'ramda'
import { League, Match, User } from '../../common/types'
import { Pool } from 'pg'
import { MatchResultBody } from '../../common/types'
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

export type DBClient = {
  users(): Promise<User[]>
  leagues(): Promise<League[]>
  match(id: number): Promise<Match | null> // null -> no such match
  deleteMatch(id: number): Promise<boolean> // true -> was actually removed
  finishMatch(id: number, result: MatchResultBody): Promise<Match | null> // null -> no such match
  latestMatches(count: number): Promise<Match[]>
  createMatch(matchData: {
    leagueId: number
    homeId: number
    awayId: number
    homeUserId: number
    awayUserId: number
  }): Promise<Match | null>
  userStats(limit: number | null): Promise<MonthUserStats[]>
  totalStats(limit: number | null): Promise<TotalStats[]>
}

export const connect = async (databaseUrl: string): Promise<DBClient> => {
  const pool = new Pool({ connectionString: databaseUrl })
  const client = await pool.connect()

  const dbClient: DBClient = {
    async users() {
      return sql.users(client)
    },

    async leagues() {
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

    async match(id) {
      const row = await sql.match(client, { matchId: id })
      return row && matchFromRow(row)
    },

    async deleteMatch(id: number) {
      return (await sql.deleteMatch(client, { matchId: id })) === 1
    },

    async finishMatch(id: number, result: MatchResultBody) {
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

    async latestMatches(count) {
      const rows = await sql.latestMatches(client, { limit: count })
      return rows.map(matchFromRow)
    },

    async createMatch({ leagueId, homeId, awayId, homeUserId, awayUserId }) {
      let result = await onIntegrityError(
        null,
        sql.createMatch(client, {
          leagueId,
          homeId,
          awayId,
          homeUserId,
          awayUserId,
        })
      )
      if (result == null) return null
      return await this.match(result.id)
    },

    async userStats(limit: number | null) {
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

    async totalStats(limit: number | null) {
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
  }

  return dbClient
}

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
