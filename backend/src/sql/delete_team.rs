use crate::db::Database;
use crate::sql::sql_types::TeamId;

pub async fn delete_team(dbc: &Database, team_id: TeamId) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        "delete_team",
        // language=SQL
        r#"
DELETE FROM team
WHERE id = $1
"#,
        &[&team_id],
    )
    .await
}
