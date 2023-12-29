use crate::db::Database;
use crate::sql::sql_types::MatchId;

pub async fn delete_match(dbc: &Database, id: MatchId) -> Result<bool, sqlx::Error> {
    sqlx::query(
        r#"
DELETE FROM match
WHERE id = $1
AND finished_type IS NULL
"#,
    )
    .bind(id)
    .execute(dbc)
    .await
    .map(|r| r.rows_affected() == 1)
}
