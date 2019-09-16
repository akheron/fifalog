import { ClientBase } from 'pg'

export async function match(
  client: ClientBase,
  params: { matchId: number }
): Promise<{
  match_id: number
  league_id: number
  league_name: string
  home_id: number
  home_name: string
  away_id: number
  away_name: string
  home_user_id: number
  home_user_name: string
  away_user_id: number
  away_user_name: string
  home_score: number | null
  away_score: number | null
  finished_type: 'fullTime' | 'overTime' | 'penalties' | null
  home_penalty_goals: number | null
  away_penalty_goals: number | null
  finished_date: string | null
} | null> {
  const result = await client.query(
    `\
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
LIMIT 1
`,
    [params.matchId]
  )
  return result.rows.length ? result.rows[0] : null
}
