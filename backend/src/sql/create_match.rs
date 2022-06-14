use super::sql_types::{LeagueId, MatchId};
use crate::sql::sql_types::{TeamId, UserId};
use tokio_postgres::Client;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn id(&self) -> MatchId {
        self.0.get(0)
    }
}

pub async fn create_match(
    dbc: &Client,
    league_id: Option<LeagueId>,
    home_id: TeamId,
    away_id: TeamId,
    home_user_id: UserId,
    away_user_id: UserId,
) -> Result<Row, tokio_postgres::Error> {
    Ok(dbc
        .query(
            r#"
INSERT INTO match (league_id, home_id, away_id, home_user_id, away_user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
"#,
            &[&league_id, &home_id, &away_id, &home_user_id, &away_user_id],
        )
        .await?
        .into_iter()
        .map(Row)
        .next()
        .unwrap())
}
