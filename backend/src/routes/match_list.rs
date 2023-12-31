use crate::api_routes::matches;
use crate::api_types::Match;
use crate::db::Database;
use askama::Template;
use eyre::Result;
use itertools::Itertools;
use sqlx::types::chrono::NaiveDate;

struct MatchDay {
    date: Option<NaiveDate>,
    matches: Vec<Match>,
}

#[derive(Template)]
#[template(path = "components/match_list.html")]
pub struct MatchListTemplate {
    match_days: Vec<MatchDay>,
    last10: i64,
    total: i64,
}

impl MatchListTemplate {
    pub async fn new(dbc: &Database) -> Result<Self> {
        let matches = matches(dbc, None, None).await?;
        let match_days = matches
            .data
            .into_iter()
            .group_by(|m| m.result.as_ref().map(|r| r.finished_time.date_naive()))
            .into_iter()
            .map(|(date, matches)| MatchDay {
                date,
                matches: matches.collect(),
            })
            .collect::<Vec<_>>();
        Ok(Self {
            match_days,
            last10: matches.last10,
            total: matches.total,
        })
    }
}

mod filters {
    use crate::api_types::{FinishedType, Match};

    #[derive(PartialEq, Eq)]
    enum Team {
        Home,
        Away,
    }

    pub fn home_player(match_: &Match) -> askama::Result<String> {
        highlight_winner(match_, Team::Home)
    }

    pub fn away_player(match_: &Match) -> askama::Result<String> {
        highlight_winner(match_, Team::Away)
    }

    fn highlight_winner(match_: &Match, team: Team) -> askama::Result<String> {
        let user = match team {
            Team::Home => &match_.home_user.name,
            Team::Away => &match_.away_user.name,
        };
        let highlight = if let Some(result) = &match_.result {
            if result.home_score == result.away_score {
                false
            } else if let FinishedType::Penalties { .. } = result.finished_type {
                false
            } else if result.home_score > result.away_score {
                team == Team::Home
            } else {
                team == Team::Away
            }
        } else {
            false
        };
        Ok(if highlight {
            format!("<strong>{}</strong>", user)
        } else {
            user.to_string()
        })
    }

    pub fn overtime_result(match_: &Match) -> askama::Result<String> {
        Ok(if let Some(result) = &match_.result {
            match &result.finished_type {
                FinishedType::FullTime => "".to_string(),
                FinishedType::OverTime => "OT".to_string(),
                FinishedType::Penalties {
                    home_goals,
                    away_goals,
                } => {
                    format!("({} - {} P)", home_goals, away_goals)
                }
            }
        } else {
            "".to_string()
        })
    }
}
