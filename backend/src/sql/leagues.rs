use crate::sql::sql_types::{LeagueId, TeamId};
use serde::Deserialize;
use tokio_postgres::types::Json;
use tokio_postgres::Client;

#[derive(Deserialize)]
pub struct Team {
    pub id: TeamId,
    pub name: String,
}

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn id(&self) -> LeagueId {
        self.0.get(0)
    }
    pub fn name(&self) -> String {
        self.0.get(1)
    }
    pub fn exclude_random_all(&self) -> bool {
        self.0.get(2)
    }
    pub fn teams(&self) -> Json<Vec<Team>> {
        self.0.get(3)
    }
}

pub async fn leagues(dbc: &Client) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
            // language=SQL
            r#"
SELECT
    league.id,
    league.name,
    league.exclude_random_all,
    json_agg(json_build_object('id', team.id, 'name', team.name) ORDER BY team.name) as teams
FROM league
JOIN team ON team.league_id = league.id
WHERE NOT team.disabled
GROUP BY league.id, league.name, league.exclude_random_all
ORDER BY league.name
"#,
            &[],
        )
        .await?
        .into_iter()
        .map(Row)
        .collect())
}
