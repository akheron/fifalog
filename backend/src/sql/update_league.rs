use crate::db::Database;
use crate::sql::sql_types::LeagueId;

pub async fn update_league(
    dbc: &Database,
    league_id: LeagueId,
    name: String,
    exclude_random_all: bool,
) -> Result<bool, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
UPDATE league
SET name = $2, exclude_random_all = $3
WHERE id = $1
"#,
    )
    .bind(league_id)
    .bind(name)
    .bind(exclude_random_all)
    .execute(dbc)
    .await
    .map(|r| r.rows_affected() == 1)
}
