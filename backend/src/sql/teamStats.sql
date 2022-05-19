SELECT
    team.name AS team,
    count(*)::int4 AS matches,
    sum(CASE WHEN team_matches.win THEN 1 ELSE 0 END)::int4 AS wins,
    round((sum(CASE WHEN team_matches.win THEN 1 ELSE 0 END)::numeric / count(*)) * 100, 2)::double precision AS win_percentage
FROM (
    SELECT home_id AS team_id, home_score > away_score AS win
    FROM match
    WHERE finished_type IS NOT NULL
    UNION ALL
    SELECT away_id AS team_id, away_score > home_score AS win
    FROM match
    WHERE finished_type IS NOT NULL
) team_matches
JOIN team ON team.id = team_id
GROUP BY team.name
ORDER BY win_percentage DESC, matches DESC
