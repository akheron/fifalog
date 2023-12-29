use crate::db::Database;
use crate::sql::sql_types::{LeagueId, TeamId};

pub async fn update_team(
    dbc: &Database,
    team_id: TeamId,
    league_id: Option<LeagueId>,
    name: Option<String>,
    disabled: Option<bool>,
) -> Result<bool, sqlx::Error> {
    sqlx::query(
        // language=SQL
        r#"
UPDATE team
SET league_id = coalesce($1, league_id), name = coalesce($2, name), disabled = coalesce($3, disabled)
WHERE id = $4
"#)
        .bind(league_id)
        .bind(name)
        .bind(disabled)
        .bind(team_id)
        .execute(dbc)
        .await
        .map(|r| r.rows_affected() == 1)
}
