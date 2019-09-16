import { ClientBase } from 'pg'

export async function leagues(
  client: ClientBase,
  params: { matchPairsToExclude: number }
): Promise<
  Array<{
    league_id: number | null
    league_name: string | null
    team_id: number | null
    team_name: string | null
  }>
> {
  const result = await client.query(
    `\
WITH latest_matches AS (
        SELECT home_id, away_id
        FROM match
        ORDER BY finished_time DESC, id DESC
        LIMIT $1::integer * 2
    ), latest_teams (team_id) AS (
       SELECT home_id
       FROM latest_matches
       UNION
       SELECT away_id
       FROM latest_matches
    )
SELECT
  league.id as league_id,
  league.name as league_name,
  team.id as team_id,
  team.name as team_name
FROM league
LEFT JOIN team ON (team.league_id = league.id)
WHERE team.id NOT IN (SELECT team_id FROM latest_teams)
ORDER BY league.name, team.name
`,
    [params.matchPairsToExclude]
  )
  return result.rows
}
