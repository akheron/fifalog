UPDATE match
SET
    finished_time = now(),
    home_score = ${homeScore},
    away_score = ${awayScore},
    finished_type = ${finishedType},
    home_penalty_goals = ${homePenaltyGoals},
    away_penalty_goals = ${awayPenaltyGoals}
WHERE
    id = ${matchId}
