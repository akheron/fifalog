use crate::sql::sql_types::{LeagueId, TeamId};
use tokio_postgres::Client;

pub async fn update_team(
    dbc: &Client,
    team_id: TeamId,
    league_id: LeagueId,
    name: String,
    disabled: bool,
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        // language=SQL
        r#"
UPDATE team
SET league_id = $1, name = $2, disabled = $3
WHERE id = $4
"#,
        &[&league_id, &name, &disabled, &team_id],
    )
    .await
}
