SELECT
  league.id as league_id,
  league.name as league_name,
  team.id as team_id,
  team.name as team_name
FROM league
LEFT JOIN team ON (team.league_id = league.id)
ORDER BY league.name, team.name
