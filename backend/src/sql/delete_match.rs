use crate::sql::sql_types::MatchId;
use tokio_postgres::Client;

pub async fn delete_match(dbc: &Client, id: MatchId) -> Result<u64, tokio_postgres::Error> {
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
