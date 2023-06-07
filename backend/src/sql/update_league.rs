use crate::db::Database;
use crate::sql::sql_types::LeagueId;

pub async fn update_league(
    dbc: &Database,
    league_id: LeagueId,
    name: String,
    exclude_random_all: bool,
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        "update_league",
        // language=SQL
        r#"
UPDATE league
SET name = $2, exclude_random_all = $3
WHERE id = $1
"#,
        &[&league_id, &name, &exclude_random_all],
    )
    .await
}
