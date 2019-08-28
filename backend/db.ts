import * as R from 'ramda'
import { League, SavedMatch, User } from '../common/types'
import { Pool } from 'pg'
import { onIntegrityError } from './db-utils'

export type DBClient = {
  users(): Promise<User[]>
  leagues(): Promise<League[]>
  match(id: number): Promise<SavedMatch | null> // null -> no such match
  deleteMatch(id: number): Promise<boolean> // true -> was actually removed
  latestMatches(count: number): Promise<SavedMatch[]>
  createMatch(matchData: {
    leagueId: number
    homeId: number
    awayId: number
    homeUserId: number
    awayUserId: number
  }): Promise<SavedMatch | null>
}

export const connect = async (databaseUrl: string): Promise<DBClient> => {
  const pool = new Pool({ connectionString: databaseUrl })
  const client = await pool.connect()

  const dbClient: DBClient = {
    async users() {
      const { rows } = await client.query(`
SELECT
  id,
  name
FROM "user"
ORDER BY name
`)
      return rows
    },

    async leagues() {
      const result = await client.query(`
SELECT
  league.id as league_id,
  league.name as league_name,
  team.id as team_id,
  team.name as team_name
FROM league
LEFT JOIN team ON (team.league_id = league.id)
ORDER BY league.name, team.name
`)
      return R.groupWith(
        (a, b) => a.league_name === b.league_name,
        result.rows
      ).map(rows => ({
        id: rows[0]['league_id'],
        name: rows[0]['league_name'],
        teams: rows.map(row => ({
          id: row['team_id'],
          name: row['team_name'],
        })),
      }))
    },

    async match(id) {
      const { rows } = await client.query(
        `
SELECT
    match.id as match_id,
    league.id as league_id,
    league.name as league_name,
    home.id as home_id,
    home.name as home_name,
    away.id as away_id,
    away.name as away_name,
    home_user.id as home_user_id,
    home_user.name as home_user_name,
    away_user.id as away_user_id,
    away_user.name as away_user_name,
    home_score,
    away_score,
    finished_type,
    home_penalty_goals,
    away_penalty_goals,
    finished_time
FROM match
JOIN league ON (league.id = league_id)
JOIN team AS home ON (home.id = home_id)
JOIN team AS away ON (away.id = away_id)
JOIN "user" AS home_user ON (home_user.id = home_user_id)
JOIN "user" AS away_user ON (away_user.id = away_user_id)
WHERE match.id = $1
`,
        [id]
      )
      if (rows.length == 1) return matchFromRow(rows[0])
      return null
    },

    async deleteMatch(id: number) {
      const result = await client.query(
        `
DELETE FROM match
WHERE id = $1
AND finished_type IS NULL
`,
        [id]
      )
      return result.rowCount === 1
    },

    async latestMatches(count = 10) {
      const { rows } = await client.query(
        `
SELECT
    match.id as match_id,
    league.id as league_id,
    league.name as league_name,
    home.id as home_id,
    home.name as home_name,
    away.id as away_id,
    away.name as away_name,
    home_user.id as home_user_id,
    home_user.name as home_user_name,
    away_user.id as away_user_id,
    away_user.name as away_user_name,
    home_score,
    away_score,
    finished_type,
    home_penalty_goals,
    away_penalty_goals,
    finished_time
FROM match
JOIN league ON (league.id = league_id)
JOIN team AS home ON (home.id = home_id)
JOIN team AS away ON (away.id = away_id)
JOIN "user" AS home_user ON (home_user.id = home_user_id)
JOIN "user" AS away_user ON (away_user.id = away_user_id)
ORDER BY match.id DESC
LIMIT $1
`,
        [count]
      )
      return rows.map(matchFromRow)
    },

    async createMatch({ leagueId, homeId, awayId, homeUserId, awayUserId }) {
      let result = await onIntegrityError(
        null,
        client.query(
          `
INSERT INTO match (league_id, home_id, away_id, home_user_id, away_user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
`,
          [leagueId, homeId, awayId, homeUserId, awayUserId]
        )
      )
      if (result == null) return null

      const id: number = result.rows[0]['id']
      return (await this.match(id)) as SavedMatch
    },
  }

  return dbClient
}

const matchFromRow = (r: any): SavedMatch => ({
  id: r['match_id'],
  leagueId: r['league_id'],
  leagueName: r['league_name'],
  home: { id: r['home_id'], name: r['home_name'] },
  away: { id: r['away_id'], name: r['away_name'] },
  homeUser: { id: r['home_user_id'], name: r['home_user_name'] },
  awayUser: { id: r['away_user_id'], name: r['away_user_name'] },
  result: r['finished_type'] && {
    finishedTime: r['finished_time'],
    homeScore: r['home_score'],
    awayScore: r['away_score'],
    finishedType:
      r['finished_type'] === 'fullTime'
        ? { kind: 'fullTime' }
        : r['finished_type'] === 'extraTime'
        ? { kind: 'extraTime' }
        : {
            kind: 'penalties',
            homeGoals: r['home_penalty_goals'],
            awayGoals: r['away_penalty_goals'],
          },
  },
})
