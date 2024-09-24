use super::sql_types::{LeagueId, MatchId};
use crate::db::Database;
use crate::sql::sql_types::{TeamId, UserId};
use sqlx::postgres::PgRow;
use sqlx::Row;

pub async fn create_match(
    dbc: &Database,
    league_id: Option<LeagueId>,
    home_id: TeamId,
    away_id: TeamId,
    home_user_id: UserId,
    away_user_id: UserId,
) -> Result<MatchId, sqlx::Error> {
    sqlx::query(
        r#"
INSERT INTO match (league_id, home_id, away_id, home_user_id, away_user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
"#,
    )
    .bind(league_id)
    .bind(home_id)
    .bind(away_id)
    .bind(home_user_id)
    .bind(away_user_id)
    .map(|row: PgRow| row.get(0))
    .fetch_one(dbc)
    .await
}
