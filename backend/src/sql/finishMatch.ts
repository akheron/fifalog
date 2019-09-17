import { ClientBase } from 'pg'

export async function finishMatch(
  client: ClientBase,
  params: {
    homeScore: number
    awayScore: number
    finishedType: 'fullTime' | 'overTime' | 'penalties'
    homePenaltyGoals: number | null
    awayPenaltyGoals: number | null
    matchId: number
  }
): Promise<number> {
  const result = await client.query(
    `\
UPDATE match
SET
    finished_time = now(),
    home_score = $1,
    away_score = $2,
    finished_type = $3,
    home_penalty_goals = $4,
    away_penalty_goals = $5
WHERE
    id = $6
`,
    [
      params.homeScore,
      params.awayScore,
      params.finishedType,
      params.homePenaltyGoals,
      params.awayPenaltyGoals,
      params.matchId,
    ]
  )
  return result.rowCount
}
