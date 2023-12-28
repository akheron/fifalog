use crate::db::Database;
use crate::sql::sql_types::LeagueId;

pub async fn create_team(
    dbc: &Database,
    league_id: LeagueId,
    name: String,
    disabled: bool,
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        // language=SQL
        r#"
INSERT INTO team (league_id, name, disabled)
VALUES ($1, $2, $3)
"#,
        &[&league_id, &name, &disabled],
    )
    .await
}
