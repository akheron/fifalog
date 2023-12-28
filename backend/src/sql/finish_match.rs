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
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
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
        &[
            &home_score,
            &away_score,
            &finished_type,
            &home_penalty_goals,
            &away_penalty_goals,
            &match_id,
        ],
    )
    .await
}
