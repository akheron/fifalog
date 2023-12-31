use crate::api_routes::{matches, MatchesResult};
use crate::api_types::{FinishedType, Match, User};
use crate::db::Database;
use crate::result::Result;
use crate::sql::users;
use crate::utils::style;
use itertools::Itertools;
use maud::{html, Markup, PreEscaped};
use sqlx::types::chrono::NaiveDate;

pub struct LatestMatches {
    pub create_match_pair_error: Option<&'static str>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

impl Default for LatestMatches {
    fn default() -> Self {
        Self {
            create_match_pair_error: None,
            page: None,
            per_page: None,
        }
    }
}

impl LatestMatches {
    pub fn with_create_match_pair_error(self, create_match_pair_error: &'static str) -> Self {
        Self {
            create_match_pair_error: Some(create_match_pair_error),
            ..self
        }
    }

    pub async fn render(self, dbc: &Database) -> Result<Markup> {
        latest_matches(dbc, self).await
    }
}

async fn latest_matches(dbc: &Database, params: LatestMatches) -> Result<Markup> {
    let users = users(&dbc)
        .await?
        .into_iter()
        .map(User::from)
        .collect::<Vec<_>>();
    let matches = matches(&dbc, params.page, params.per_page).await?;

    let create_match_pair = create_match_pair(&users, params.create_match_pair_error);
    let match_list = match_list(matches);

    Ok(html! {
        div #latest-matches {
            h2 { "Latest matches" }
            @if let Some(c) = create_match_pair { (c) }
            (match_list)
        }
    })
}

fn create_match_pair(users: &[User], error: Option<&'static str>) -> Option<Markup> {
    if users.len() < 2 {
        return None;
    }
    let user1 = users[0].id;
    let user2 = users[1].id;
    Some(html! {
        form hx-target="#latest-matches" {
            select name="user1" {
                @for user in users {
                    option value=(user.id) selected[user.id == user1] {
                        (user.name)
                    }
                }
            }
            " vs. "
            select name="user2" {
                @for user in users {
                    option value=(user.id) selected[user.id == user2] {
                        (user.name)
                    }
                }
            }
            script {
                (PreEscaped(r#"
                    (() => {
                        const user1Select = document.querySelector('select[name="user1"]');
                        const user2Select = document.querySelector('select[name="user2"]');

                        function disableSame(event) {
                            user1Select.querySelectorAll('option').forEach((option) => {
                                option.disabled = option.value === user2Select.value;
                            });
                            user2Select.querySelectorAll('option').forEach((option) => {
                                option.disabled = option.value === user1Select.value;
                            });
                        }

                        user1Select.addEventListener('change', disableSame);
                        user2Select.addEventListener('change', disableSame);
                        disableSame();
                    })();
                "#))
            }
            span .hgap-s {}
            button hx-post="/match/randomize" hx-vals="{\"respectLeagues\": false}" { "Randomize" }
            span .hgap-s {}
            button hx-post="/match/randomize" hx-vals="{\"respectLeagues\": true}" { "In leagues" }
        }
        @if let Some(error) = error {
            div .error {
                (error)
                (style(r#"me { color: red; }"#))
            }
        }
    })
}

struct MatchDay {
    date: Option<NaiveDate>,
    matches: Vec<Match>,
}

fn match_list(matches: MatchesResult) -> Markup {
    let match_days = matches
        .data
        .into_iter()
        .chunk_by(|m| m.result.as_ref().map(|r| r.finished_time.date_naive()))
        .into_iter()
        .map(|(date, matches)| MatchDay {
            date,
            matches: matches.collect(),
        })
        .collect::<Vec<_>>();
    html! {
        div {
            @for match_day in match_days {
                div .match-day {
                    div .date {
                        @match match_day.date {
                            Some(date) => { (date.format("%a %Y-%m-%d")) }
                            None => { "Not played yet" }
                        }
                    }
                    @for match_ in match_day.matches {
                        div .match {
                            @match match_.index {
                                Some(index) => { div .index { "Match " (index) } }
                                None => {}
                            }
                            div .row {
                                div { (match_.home.name) }
                                div {
                                    div .score {
                                        @if let Some(result) = &match_.result {
                                            strong { (result.home_score) } " - " strong { (result.away_score) }
                                        } @else {
                                            "-"
                                        }
                                    }
                                }
                                div { (match_.away.name) }
                            }
                            div .row {
                                div .player { (highlight_winner(&match_, Team::Home)) }
                                div .overtime { (overtime_result(&match_)) }
                                div .player { (highlight_winner(&match_, Team::Away)) }
                            }
                            @if match_.result.is_none() {
                                div .vgap-s {}
                                div .buttons hx-disabled-elt="button" {
                                    button { "stats ▽" }
                                    span .hgap-s {}
                                    button { "edit" }
                                    span .hgap-s {}
                                    button hx-delete=(format!("/match/{}", match_.id)) hx-target="#latest-matches" hx-confirm="Really?" { "x" }
                                }
                            }
                            @if match_.index.is_some() && match_.index.unwrap() == matches.last10 {
                                div .last10 {}
                            }
                        }
                    }
                }
            }
            (style(r#"
                me {
                  position: relative;

                  .loadingOverlay {
                    position: absolute;
                    z-index: 100;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background-color: rgba(0, 0, 0, 0.1);
                  }

                  .pagination {
                    display: flex;
                    justify-content: center;
                    margin: 10px 0;
                  }

                  .match-day:not(:first-child) {
                    border-top: 1px solid #ccc;
                  }

                  .date {
                    padding: 15px 0 20px 0;
                    text-align: center;
                    font-size: 13px;
                    text-decoration: underline;
                  }

                  .last10 {
                    padding-bottom: 10px;
                  }

                  .last10::before {
                    content: "";
                    display: block;
                    margin: 0 auto;
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid #ffa500;
                  }

                  .match {
                    padding-bottom: 25px;
                  }

                  .index {
                    text-align: center;
                    font-size: 13px;
                    color: #999;
                    padding-bottom: 4px;
                  }

                  .row {
                    display: flex;
                  }

                  .row > :nth-child(1) {
                    width: 40%;
                    text-align: right;
                  }

                  .row > :nth-child(2) {
                    text-align: center;
                    width: 20%;
                  }

                  .row > :nth-child(3) {
                    width: 40%;
                  }

                  .score {
                    font-size: 18px;
                  }

                  .overtime {
                    font-size: 13px;
                  }

                  .player {
                    font-size: 13px;
                    color: #999;
                  }

                  .player strong {
                    color: #008000;
                  }

                  .buttons {
                    text-align: center;
                  }

                  .buttons button {
                    font-size: 12px;
                    line-height: 12px;
                  }

                  .stats {
                    font-size: 13px;
                  }

                  .stats span.dimmed {
                    display: inline-block;
                    margin: 0 6px;
                    color: #999;
                  }
                }
            "#))
        }
    }
}

#[derive(PartialEq, Eq)]
enum Team {
    Home,
    Away,
}

fn home_player(match_: &Match) -> Markup {
    highlight_winner(match_, Team::Home)
}

fn away_player(match_: &Match) -> Markup {
    highlight_winner(match_, Team::Away)
}

fn highlight_winner(match_: &Match, team: Team) -> Markup {
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
    if highlight {
        html! { strong { (user) } }
    } else {
        html! { (user.to_string()) }
    }
}

pub fn overtime_result(match_: &Match) -> Markup {
    if let Some(result) = &match_.result {
        match &result.finished_type {
            FinishedType::FullTime => html! {},
            FinishedType::OverTime => html! { "OT" },
            FinishedType::Penalties {
                home_goals,
                away_goals,
            } => {
                html! { "(" (home_goals) " - " (away_goals) "P)" }
            }
        }
    } else {
        html! {}
    }
}
