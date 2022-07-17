use crate::sql::sql_types::TeamId;
use tokio_postgres::Client;

pub async fn delete_team(dbc: &Client, team_id: TeamId) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        // language=SQL
        r#"
DELETE FROM team
WHERE id = $1
"#,
        &[&team_id],
    )
    .await
}
