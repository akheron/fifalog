use crate::db::Database;
use crate::sql::sql_types::{LeagueId, TeamId};
use serde::Deserialize;
use sqlx::postgres::PgRow;
use sqlx::types::Json;
use sqlx::Row as _;

#[derive(Deserialize)]
pub struct Team {
    pub id: TeamId,
    pub name: String,
    pub disabled: bool,
    pub match_count: i32,
}

pub struct Row {
    pub id: LeagueId,
    pub name: String,
    pub exclude_random_all: bool,
    pub teams: Vec<Team>,
}

pub async fn leagues(dbc: &Database, include_disabled: bool) -> Result<Vec<Row>, sqlx::Error> {
    sqlx::query(
        // language=SQL
        &format!(
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
{}
GROUP BY league.id, league.name, league.exclude_random_all
ORDER BY league.name
"#,
            if include_disabled {
                ""
            } else {
                "WHERE NOT team.disabled"
            }
        ),
    )
    .map(|row: PgRow| Row {
        id: row.get(0),
        name: row.get(1),
        exclude_random_all: row.get(2),
        teams: row.get::<Json<Vec<Team>>, _>(3).0,
    })
    .fetch_all(dbc)
    .await
}
