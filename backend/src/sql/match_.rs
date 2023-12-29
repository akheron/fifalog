use super::FinishedType;
use crate::db::Database;
use crate::sql::sql_types::{LeagueId, MatchId, TeamId, UserId};
use sqlx::types::chrono::{DateTime, Local};

#[derive(sqlx::FromRow)]
pub struct Row {
    pub match_id: MatchId,
    pub league_id: Option<LeagueId>,
    pub league_name: Option<String>,
    pub home_id: TeamId,
    pub home_name: String,
    pub away_id: TeamId,
    pub away_name: String,
    pub home_user_id: UserId,
    pub home_user_name: String,
    pub away_user_id: UserId,
    pub away_user_name: String,
    pub home_score: Option<i32>,
    pub away_score: Option<i32>,
    pub finished_type: Option<FinishedType>,
    pub home_penalty_goals: Option<i32>,
    pub away_penalty_goals: Option<i32>,
    pub finished_time: Option<DateTime<Local>>,
    pub index: i64,
}

pub async fn match_(dbc: &Database, match_id: MatchId) -> Result<Option<Row>, sqlx::Error> {
    sqlx::query_as::<_, Row>(
        // language=SQL
        r#"
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
    finished_time,
    row_number() over (ORDER BY finished_time, match.id) AS index
FROM match
LEFT JOIN league ON league.id = league_id
JOIN team AS home ON home.id = home_id
JOIN team AS away ON away.id = away_id
JOIN "user" AS home_user ON home_user.id = home_user_id
JOIN "user" AS away_user ON away_user.id = away_user_id
WHERE match.id = $1
"#,
    )
    .bind(match_id)
    .fetch_optional(dbc)
    .await
}
