use crate::db::Database;
use crate::sql::sql_types::TeamId;

pub async fn delete_team(dbc: &Database, team_id: TeamId) -> Result<bool, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
DELETE FROM team
WHERE id = $1
"#,
    )
    .bind(team_id)
    .execute(dbc)
    .await
    .map(|r| r.rows_affected() == 1)
}
