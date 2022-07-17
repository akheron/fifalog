use crate::sql::sql_types::{LeagueId, TeamId};
use serde::Deserialize;
use tokio_postgres::types::Json;
use tokio_postgres::Client;

#[derive(Deserialize)]
pub struct Team {
    pub id: TeamId,
    pub name: String,
    pub disabled: bool,
    pub match_count: i32,
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
    pub fn teams(&self) -> Vec<Team> {
        let Json(teams) = self.0.get(3);
        teams
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
    coalesce(
        json_agg(
            json_build_object(
                'id', team.id,
                'name', team.name,
                'disabled', team.disabled,
                'match_count', (
                    SELECT count(*)
                    FROM match
                    WHERE home_id = team.id OR away_id = team.id
                )
            )
            ORDER BY team.name
        ) FILTER (WHERE team.id IS NOT NULL),
    '[]'::json) AS teams
FROM league
LEFT JOIN team ON team.league_id = league.id
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
