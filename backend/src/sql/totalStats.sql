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
        WHEN ${limit} = 0 THEN NULL
        ELSE ${limit}
    END
)
SELECT
    CASE WHEN ${limit} = 0 THEN to_char(finished_time, 'YYYY-MM')
         ELSE 'Last ' || ${limit}
    END as month,
    count(id)::integer as match_count,
    sum(tie::integer)::integer AS tie_count,
    sum(goal_count)::integer as goal_count
FROM result
GROUP BY month
ORDER BY month DESC
