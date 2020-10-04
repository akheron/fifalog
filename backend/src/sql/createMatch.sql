INSERT INTO match (league_id, home_id, away_id, home_user_id, away_user_id)
VALUES (${leagueId}, ${homeId}, ${awayId}, ${homeUserId}, ${awayUserId})
RETURNING id
