import { ClientBase } from 'pg'

export async function totalStats(
  client: ClientBase
): Promise<Array<{ month: string; match_count: number; tie_count: number }>> {
  const result = await client.query(`\
SELECT
    to_char(match.finished_time, 'YYYY-MM') as month,
    count(*)::integer as match_count,
    sum((
        match.home_score = match.away_score OR
        match.finished_type = 'penalties'
    )::integer)::integer AS tie_count
FROM match
WHERE
    match.finished_type IS NOT NULL AND
    match.finished_time IS NOT NULL AND
    match.home_score IS NOT NULL AND
    match.away_score IS NOT NULL
GROUP BY month
ORDER BY month DESC
`)
  return result.rows
}
