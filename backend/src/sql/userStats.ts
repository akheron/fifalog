import { ClientBase } from 'pg'

export async function userStats(
  client: ClientBase
): Promise<
  Array<{
    month: string | null
    user_id: number
    user_name: string
    win_count: number
    overtime_win_count: number
  }>
> {
  const result = await client.query(`\
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
    ))::integer)::integer AS win_count,
    sum(((
        match.home_user_id = "user".id AND
        match.finished_type = 'overTime' AND
        match.home_score > match.away_score
    ) OR (
        match.away_user_id = "user".id AND
        match.finished_type = 'overTime' AND
        match.away_score > match.home_score
    ))::integer)::integer AS overtime_win_count
FROM "user"
JOIN match ON (match.home_user_id = "user".id or match.away_user_id = "user".id)
JOIN team AS home_team ON (home_team.id = match.home_id)
JOIN team AS away_team ON (away_team.id = match.away_id)
WHERE match.finished_type IS NOT NULL
GROUP BY month, user_id, user_name
ORDER BY month DESC, win_count ASC
`)
  return result.rows
}
