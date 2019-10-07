import { ClientBase } from 'pg'

export async function totalStats(
  client: ClientBase,
  params: { limit: number }
): Promise<
  Array<{
    month: string
    match_count: number
    tie_count: number
    goal_count: number
  }>
> {
  const result = await client.query(
    `\
WITH result AS (
    SELECT
        id,
        finished_time,
        home_score = away_score OR finished_type = 'penalties' AS tie,
        home_score + away_score AS goal_count
    FROM match
    WHERE
        finished_type IS NOT NULL AND
        finished_time IS NOT NULL AND
        home_score IS NOT NULL AND
        away_score IS NOT NULL
    ORDER BY finished_time DESC
    LIMIT CASE
        WHEN $1 = 0 THEN NULL
        ELSE $1
    END
)
SELECT
    CASE WHEN $1 = 0 THEN to_char(finished_time, 'YYYY-MM')
         ELSE 'Last ' || $1
    END as month,
    count(id)::integer as match_count,
    sum(tie::integer)::integer AS tie_count,
    sum(goal_count)::integer as goal_count
FROM result
GROUP BY month
`,
    [params.limit]
  )
  return result.rows
}
