import { ClientBase } from 'pg'

export async function leagues(
  client: ClientBase
): Promise<
  Array<{
    league_id: number
    league_name: string
    team_id: number
    team_name: string
  }>
> {
  const result = await client.query(`\
SELECT
  league.id as league_id,
  league.name as league_name,
  team.id as team_id,
  team.name as team_name
FROM league
LEFT JOIN team ON (team.league_id = league.id)
ORDER BY league.name, team.name
`)
  return result.rows
}
