SELECT
    match.id as match_id,
    league.id as league_id,
    league.name as league_name,
    home.id as home_id,
    home.name as home_name,
    away.id as away_id,
    away.name as away_name,
    home_user.id as home_user_id,
    home_user.name as home_user_name,
    away_user.id as away_user_id,
    away_user.name as away_user_name,
    home_score,
    away_score,
    finished_type,
    home_penalty_goals,
    away_penalty_goals,
    to_char(finished_time, 'Day YYYY-MM-DD') AS finished_date
FROM match
JOIN league ON (league.id = league_id)
JOIN team AS home ON (home.id = home_id)
JOIN team AS away ON (away.id = away_id)
JOIN "user" AS home_user ON (home_user.id = home_user_id)
JOIN "user" AS away_user ON (away_user.id = away_user_id)
WHERE match.id = ${matchId}
LIMIT 1
