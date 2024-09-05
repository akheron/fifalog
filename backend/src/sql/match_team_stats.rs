use crate::db::Database;
use crate::sql::sql_types::MatchId;

#[derive(sqlx::FromRow)]
pub struct Row {
    pub total_matches_home: Option<i64>,
    pub total_wins_home: Option<i64>,
    pub total_goals_for_home: Option<i64>,
    pub total_goals_against_home: Option<i64>,
    pub total_matches_away: Option<i64>,
    pub total_wins_away: Option<i64>,
    pub total_goals_for_away: Option<i64>,
    pub total_goals_against_away: Option<i64>,
    pub pair_matches: Option<i64>,
    pub pair_wins_home: Option<i64>,
    pub pair_wins_away: Option<i64>,
}

pub async fn match_team_stats(dbc: &Database, match_id: MatchId) -> Result<Row, sqlx::Error> {
    sqlx::query_as::<_, Row>(
        // language=SQL
        r#"
WITH total_matches AS (
    SELECT
        home_id AS team_id,
        1 AS matches,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS wins,
        home_score AS goals_for,
        away_score AS goals_against
    FROM match
    WHERE finished_type IS NOT NULL

    UNION ALL

    SELECT
        away_id AS team_id,
        1 AS matches,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS wins,
        away_score AS goals_for,
        home_score AS goals_against
    FROM match
    WHERE finished_type IS NOT NULL
), team_stats AS (
    SELECT
        team_id,
        SUM(matches) AS matches,
        SUM(wins) AS wins,
        SUM(goals_for) AS goals_for,
        SUM(goals_against) AS goals_against
    FROM total_matches
    GROUP BY team_id
), pair_matches AS (
    SELECT
        home_id AS team_1,
        away_id AS team_2,
        1 AS matches,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_1_win,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_2_win
    FROM match
    WHERE finished_type IS NOT NULL

    UNION ALL

    SELECT
        away_id AS team_1,
        home_id AS team_2,
        1 AS matches,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_1_win,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_2_win
    FROM match
    WHERE finished_type IS NOT NULL
), pair_stats AS (
    SELECT
        team_1,
        team_2,
        SUM(matches) AS pair_matches,
        SUM(team_1_win) AS team_1_wins,
        SUM(team_2_win) AS team_2_wins
    FROM pair_matches
    GROUP BY team_1, team_2
)
SELECT
    ts1.matches AS total_matches_home,
    ts1.wins AS total_wins_home,
    ts1.goals_for AS total_goals_for_home,
    ts1.goals_against AS total_goals_against_home,
    ts2.matches AS total_matches_away,
    ts2.wins AS total_wins_away,
    ts2.goals_for AS total_goals_for_away,
    ts2.goals_against AS total_goals_against_away,
    ps.pair_matches AS pair_matches,
    ps.team_1_wins AS pair_wins_home,
    ps.team_2_wins AS pair_wins_away
FROM match
LEFT JOIN team_stats ts1 ON ts1.team_id = match.home_id
LEFT JOIN team_stats ts2 ON ts2.team_id = match.away_id
LEFT JOIN pair_stats ps ON ps.team_1 = match.home_id AND ps.team_2 = match.away_id
WHERE match.id = $1
    "#,
    )
    .bind(match_id)
    .fetch_one(dbc)
    .await
}
