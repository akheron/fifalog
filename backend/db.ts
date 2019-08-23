import * as R from 'ramda'
import { League, FinishedMatch } from '../common/types'
import { Pool } from 'pg'

export type DBClient = {
  leagues(): Promise<League[]>
  latestFinishedMatches(count: number): Promise<FinishedMatch[]>
}

export const connect = async (databaseUrl: string): Promise<DBClient> => {
  const pool = new Pool({ connectionString: databaseUrl })
  const client = await pool.connect()

  return {
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

    async latestFinishedMatches(count = 10) {
      const result = await client.query(
        `
SELECT
    finished_match.id as finished_match_id,
    league.id as league_id,
    league.name as league_name,
    home.id as home_id,
    home.name as home_name,
    away.id as away_id,
    away.name as away_name,
    timestamp
FROM finished_match
JOIN league ON (league.id = league_id)
JOIN team AS home ON (home.id = home_id)
JOIN team AS away ON (home.id = away_id)
LIMIT ?
`,
        [count]
      )
      return result.rows.map(r => ({
        id: r['finished_match_id'],
        leagueId: r['league_id'],
        leagueName: r['league_name'],
        home: { id: r['home_id'], name: r['home_name'] },
        away: { id: r['away_id'], name: r['away_name'] },
        timestamp: r['timestamp'],
      }))
    },
  }
}
