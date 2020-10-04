DELETE FROM match
WHERE id = ${matchId}
AND finished_type IS NULL
