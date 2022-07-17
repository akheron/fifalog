use crate::sql::sql_types::LeagueId;
use tokio_postgres::Client;

pub async fn update_league(
    dbc: &Client,
    league_id: LeagueId,
    name: String,
    exclude_random_all: bool,
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
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
