use crate::db::Database;
use crate::sql::sql_types::MatchId;

pub async fn delete_match(dbc: &Database, id: MatchId) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        r#"
DELETE FROM match
WHERE id = $1
AND finished_type IS NULL
"#,
        &[&id],
    )
    .await
}
