import * as R from 'ramda'
import { League, Match, User } from '../common/types'
import { Pool } from 'pg'
import { MatchResultBody } from '../common/types'
import { onIntegrityError } from './db-utils'

type MonthUserStats = {
  month: string
  user: User
  wins: number
  overTimeWins: number
}

type TotalStats = {
  month: string
  matches: number
  ties: number
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
  userStats(): Promise<MonthUserStats[]>
  totalStats(): Promise<TotalStats[]>
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
    to_char(finished_time, 'Day YYYY-MM-DD') AS finished_date
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

    async finishMatch(id: number, result: MatchResultBody) {
      const { rowCount } = await client.query(
        `
UPDATE match
SET
    finished_time = now(),
    home_score = $2,
    away_score = $3,
    finished_type = $4,
    home_penalty_goals = $5,
    away_penalty_goals = $6
WHERE
    id = $1
`,
        [
          id,
          result.homeScore,
          result.awayScore,
          result.finishedType.kind,
          ...(result.finishedType.kind === 'penalties'
            ? [result.finishedType.homeGoals, result.finishedType.awayGoals]
            : [null, null]),
        ]
      )
      if (rowCount == 0) return null

      return this.match(id)
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
    to_char(finished_time, 'Day YYYY-MM-DD') AS finished_date
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
      return (await this.match(id)) as Match
    },

    async userStats() {
      const { rows } = await client.query(`
SELECT
    to_char(match.finished_time, 'YYYY-MM') as month,
    "user".id AS user_id,
    "user".name AS user_name,
    sum(((
        match.home_user_id = "user".id AND
        match.finished_type <> 'penalties' AND
        match.home_score > match.away_score
    ) OR (
        match.away_user_id = "user".id AND
        match.finished_type <> 'penalties' AND
        match.away_score > match.home_score
    )) :: int) AS win_count,
    sum(((
        match.home_user_id = "user".id AND
        match.finished_type = 'overTime' AND
        match.home_score > match.away_score
    ) OR (
        match.away_user_id = "user".id AND
        match.finished_type = 'overTime' AND
        match.away_score > match.home_score
    )) :: int) AS overtime_win_count
FROM "user"
JOIN match ON (match.home_user_id = "user".id or match.away_user_id = "user".id)
JOIN team AS home_team ON (home_team.id = match.home_id)
JOIN team AS away_team ON (away_team.id = match.away_id)
WHERE match.finished_type IS NOT NULL
GROUP BY month, user_id, user_name
ORDER BY month DESC, win_count ASC
`)
      return rows.map((r: any) => ({
        month: r.month,
        user: {
          id: r.user_id,
          name: r.user_name,
        },
        wins: r.win_count,
        overTimeWins: r.overtime_win_count,
      }))
    },

    async totalStats() {
      const { rows } = await client.query(
        `
SELECT
    to_char(match.finished_time, 'YYYY-MM') as month,
    count(*) as match_count,
    sum((
        match.home_score = match.away_score OR
        match.finished_type = 'penalties'
    ) :: int) AS tie_count
FROM match
GROUP BY month
ORDER BY month DESC
`
      )
      return rows.map((r: any) => ({
        month: r.month,
        matches: r.match_count,
        ties: r.tie_count,
      }))
    },
  }

  return dbClient
}

const matchFromRow = (r: any): Match => ({
  id: r['match_id'],
  leagueId: r['league_id'],
  leagueName: r['league_name'],
  home: { id: r['home_id'], name: r['home_name'] },
  away: { id: r['away_id'], name: r['away_name'] },
  homeUser: { id: r['home_user_id'], name: r['home_user_name'] },
  awayUser: { id: r['away_user_id'], name: r['away_user_name'] },
  result: r['finished_type'] && {
    finishedDate: r['finished_date'],
    homeScore: r['home_score'],
    awayScore: r['away_score'],
    finishedType:
      r['finished_type'] === 'fullTime'
        ? { kind: 'fullTime' }
        : r['finished_type'] === 'overTime'
        ? { kind: 'overTime' }
        : {
            kind: 'penalties',
            homeGoals: r['home_penalty_goals'],
            awayGoals: r['away_penalty_goals'],
          },
  },
})
