use crate::sql::sql_types::{LeagueId, TeamId};
use tokio_postgres::Client;

pub async fn update_team(
    dbc: &Client,
    team_id: TeamId,
    league_id: Option<LeagueId>,
    name: Option<String>,
    disabled: Option<bool>,
) -> Result<u64, tokio_postgres::Error> {
    dbc.execute(
        // language=SQL
        r#"
UPDATE team
SET league_id = coalesce($1, league_id), name = coalesce($2, name), disabled = coalesce($3, disabled)
WHERE id = $4
"#,
        &[&league_id, &name, &disabled, &team_id],
    )
    .await
}
