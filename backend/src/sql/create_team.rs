use crate::db::Database;
use crate::sql::sql_types::LeagueId;

pub async fn create_team(
    dbc: &Database,
    league_id: LeagueId,
    name: String,
    disabled: bool,
) -> Result<bool, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
INSERT INTO team (league_id, name, disabled)
VALUES ($1, $2, $3)
"#,
    )
    .bind(league_id)
    .bind(name)
    .bind(disabled)
    .execute(dbc)
    .await
    .map(|r| r.rows_affected() == 1)
}
