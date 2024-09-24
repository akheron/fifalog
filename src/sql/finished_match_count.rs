use crate::db::Database;
use sqlx::postgres::PgRow;
use sqlx::Row;

pub async fn finished_match_count(dbc: &Database) -> Result<i64, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
SELECT COUNT(*) FROM match WHERE finished_type IS NOT NULL
"#,
    )
    .map(|r: PgRow| r.get(0))
    .fetch_one(dbc)
    .await
}
