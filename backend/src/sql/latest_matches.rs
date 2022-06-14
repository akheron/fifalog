use super::FinishedType;
use crate::sql::sql_types::{LeagueId, MatchId, TeamId, UserId};
use tokio_postgres::Client;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn match_id(&self) -> MatchId {
        self.0.get(0)
    }
    pub fn league_id(&self) -> Option<LeagueId> {
        self.0.get(1)
    }
    pub fn league_name(&self) -> Option<String> {
        self.0.get(2)
    }
    pub fn home_id(&self) -> TeamId {
        self.0.get(3)
    }
    pub fn home_name(&self) -> String {
        self.0.get(4)
    }
    pub fn away_id(&self) -> TeamId {
        self.0.get(5)
    }
    pub fn away_name(&self) -> String {
        self.0.get(6)
    }
    pub fn home_user_id(&self) -> UserId {
        self.0.get(7)
    }
    pub fn home_user_name(&self) -> String {
        self.0.get(8)
    }
    pub fn away_user_id(&self) -> UserId {
        self.0.get(9)
    }
    pub fn away_user_name(&self) -> String {
        self.0.get(10)
    }
    pub fn home_score(&self) -> Option<i32> {
        self.0.get(11)
    }
    pub fn away_score(&self) -> Option<i32> {
        self.0.get(12)
    }
    pub fn finished_type(&self) -> Option<FinishedType> {
        self.0.get(13)
    }
    pub fn home_penalty_goals(&self) -> Option<i32> {
        self.0.get(14)
    }
    pub fn away_penalty_goals(&self) -> Option<i32> {
        self.0.get(15)
    }
    pub fn finished_date(&self) -> Option<String> {
        self.0.get(16)
    }
}

pub async fn latest_matches(dbc: &Client, count: i32) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
            // language=SQL
            r#"
SELECT
    match.id as match_id,
    league.id as league_id,
    league.name as league_name,
    home.id as home_id,
    home.name as home_name,
    away.id as away_id,
    away.name as away_name,
    home_user.id as home_user_id,
    home_user.name as home_user_name,
    away_user.id as away_user_id,
    away_user.name as away_user_name,
    home_score,
    away_score,
    finished_type,
    home_penalty_goals,
    away_penalty_goals,
    to_char(finished_time, 'DayYYYY-MM-DD') AS finished_date
FROM match
LEFT JOIN league ON (league.id = league_id)
JOIN team home ON (home.id = home_id)
JOIN team away ON (away.id = away_id)
JOIN "user" home_user ON (home_user.id = home_user_id)
JOIN "user" away_user ON (away_user.id = away_user_id)
ORDER BY finished_time DESC, match.id DESC
LIMIT $1::integer
"#,
            &[&count],
        )
        .await?
        .into_iter()
        .map(Row)
        .collect())
}
