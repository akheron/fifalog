use crate::sql;
use crate::sql::sql_types::{LeagueId, MatchId, TeamId, UserId};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: UserId,
    pub name: String,
}

impl From<sql::users::Row> for User {
    fn from(row: sql::users::Row) -> Self {
        Self {
            id: row.id,
            name: row.name,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Team {
    pub id: TeamId,
    pub name: String,
    pub disabled: bool,
    pub match_count: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct League {
    pub id: LeagueId,
    pub name: String,
    pub exclude_random_all: bool,
    pub teams: Vec<Team>,
}

impl From<sql::leagues::Row> for League {
    fn from(row: sql::leagues::Row) -> Self {
        Self {
            id: row.id,
            name: row.name,
            exclude_random_all: row.exclude_random_all,
            teams: row
                .teams
                .into_iter()
                .map(|team| Team {
                    id: team.id,
                    name: team.name,
                    disabled: team.disabled,
                    match_count: team.match_count,
                })
                .collect(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamStub {
    pub id: TeamId,
    pub name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub id: MatchId,
    pub index: Option<i64>,
    pub league_id: Option<LeagueId>,
    pub league_name: Option<String>,
    pub home: TeamStub,
    pub away: TeamStub,
    pub home_user: User,
    pub away_user: User,
    pub result: Option<MatchResult>, // None means not finished
}

const DATE_FORMAT: &str = "%a %Y-%m-%d";

impl From<sql::matches::Row> for Match {
    fn from(row: sql::matches::Row) -> Self {
        Self {
            id: row.match_id,
            index: row.finished_type.as_ref().map(|_| row.index),
            league_id: row.league_id,
            league_name: row.league_name,
            home: TeamStub {
                id: row.home_id,
                name: row.home_name,
            },
            away: TeamStub {
                id: row.away_id,
                name: row.away_name,
            },
            home_user: User {
                id: row.home_user_id,
                name: row.home_user_name,
            },
            away_user: User {
                id: row.away_user_id,
                name: row.away_user_name,
            },
            result: row.finished_type.map(|finished_type| MatchResult {
                home_score: row.home_score.unwrap(),
                away_score: row.away_score.unwrap(),
                finished_type: match finished_type {
                    sql::FinishedType::FullTime => FinishedType::FullTime,
                    sql::FinishedType::OverTime => FinishedType::OverTime,
                    sql::FinishedType::Penalties => FinishedType::Penalties {
                        home_goals: row.home_penalty_goals.unwrap(),
                        away_goals: row.away_penalty_goals.unwrap(),
                    },
                },
                finished_date: row.finished_time.unwrap().format(DATE_FORMAT).to_string(),
            }),
        }
    }
}

impl From<sql::match_::Row> for Match {
    fn from(row: sql::match_::Row) -> Self {
        Self {
            id: row.match_id,
            index: row.finished_type.as_ref().map(|_| row.index),
            league_id: row.league_id,
            league_name: row.league_name,
            home: TeamStub {
                id: row.home_id,
                name: row.home_name,
            },
            away: TeamStub {
                id: row.away_id,
                name: row.away_name,
            },
            home_user: User {
                id: row.home_user_id,
                name: row.home_user_name,
            },
            away_user: User {
                id: row.away_user_id,
                name: row.away_user_name,
            },
            result: row.finished_type.map(|finished_type| MatchResult {
                home_score: row.home_score.unwrap(),
                away_score: row.away_score.unwrap(),
                finished_type: match finished_type {
                    sql::FinishedType::FullTime => FinishedType::FullTime,
                    sql::FinishedType::OverTime => FinishedType::OverTime,
                    sql::FinishedType::Penalties => FinishedType::Penalties {
                        home_goals: row.home_penalty_goals.unwrap(),
                        away_goals: row.away_penalty_goals.unwrap(),
                    },
                },
                finished_date: row.finished_time.unwrap().format(DATE_FORMAT).to_string(),
            }),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchResult {
    pub finished_date: String,
    pub home_score: i32,
    pub away_score: i32,
    pub finished_type: FinishedType,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum FinishedType {
    FullTime,
    OverTime,
    #[serde(rename_all = "camelCase")]
    Penalties {
        home_goals: i32,
        away_goals: i32,
    },
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub month: String,
    pub user_stats: Vec<UserStats>,
    pub ties: i32,
    pub matches: i32,
    pub goals: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStats {
    pub user: User,
    pub wins: i32,
    pub over_time_wins: i32,
    pub goals_for: i32,
}

impl From<sql::user_stats::Row> for UserStats {
    fn from(row: sql::user_stats::Row) -> Self {
        Self {
            user: User {
                id: row.user_id,
                name: row.user_name,
            },
            wins: row.win_count,
            over_time_wins: row.overtime_win_count,
            goals_for: row.goals_for,
        }
    }
}
