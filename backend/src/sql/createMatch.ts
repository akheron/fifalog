import { ClientBase } from 'pg'

export async function createMatch(
  client: ClientBase,
  params: {
    leagueId: number
    homeId: number
    awayId: number
    homeUserId: number
    awayUserId: number
  }
): Promise<{ id: number }> {
  const result = await client.query(
    `\
INSERT INTO match (league_id, home_id, away_id, home_user_id, away_user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
`,
    [
      params.leagueId,
      params.homeId,
      params.awayId,
      params.homeUserId,
      params.awayUserId,
    ]
  )
  return result.rows[0]
}
