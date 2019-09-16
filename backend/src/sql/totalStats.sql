SELECT
    to_char(match.finished_time, 'YYYY-MM') as month,
    count(*)::integer as match_count,
    sum((
        match.home_score = match.away_score OR
        match.finished_type = 'penalties'
    )::integer)::integer AS tie_count
FROM match
WHERE match.finished_time IS NOT NULL
GROUP BY month
ORDER BY month DESC
