use super::FinishedType;
use crate::db::Database;
use crate::sql::sql_types::MatchId;

pub async fn finish_match(
    dbc: &Database,
    match_id: MatchId,
    finished_type: FinishedType,
    home_score: Option<i32>,
    away_score: Option<i32>,
    home_penalty_goals: Option<i32>,
    away_penalty_goals: Option<i32>,
) -> Result<bool, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
UPDATE match
SET
    finished_time = now(),
    home_score = $1,
    away_score = $2,
    finished_type = $3,
    home_penalty_goals = $4,
    away_penalty_goals = $5
WHERE
    id = $6
"#,
    )
    .bind(home_score)
    .bind(away_score)
    .bind(finished_type)
    .bind(home_penalty_goals)
    .bind(away_penalty_goals)
    .bind(match_id)
    .execute(dbc)
    .await
    .map(|r| r.rows_affected() == 1)
}
