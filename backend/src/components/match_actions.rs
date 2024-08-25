use crate::domain;
use crate::sql::sql_types::MatchId;
use crate::utils::style;
use maud::{html, Markup};

pub enum MatchActionsMode {
    Blank,
    Stats(domain::MatchStats),
    Edit,
}

pub fn match_actions(match_id: MatchId, mode: MatchActionsMode) -> Markup {
    let show_stats = match mode {
        MatchActionsMode::Stats(_) => true,
        _ => false,
    };
    html! {
        div .match-actions {
            div .buttons hx-sync="this" {
                button
                    hx-get=(format!("/match/{}/actions", match_id))
                    hx-target="closest .match-actions"
                    hx-vals=[if show_stats { None } else { Some(r#"{ "mode": "stats" }"#) }] {
                        "stats "
                        @if show_stats { "△" } @else { "▽" }
                }
                span .hgap-s {}
                button { "edit" }
                span .hgap-s {}
                button
                    hx-delete=(format!("/match/{}", match_id))
                    hx-target="#latest-matches"
                    hx-confirm="Really?" { "x" }
            }
            @if let MatchActionsMode::Stats(match_stats) = mode {
                div .team-stats {
                    (match_team_stats(match_stats))
                }
            }
        }
    }
}

fn match_team_stats(stats: domain::MatchStats) -> Markup {
    html! {
        div {
            div .row {
                div {
                    @if let Some(pair) = stats.home.pair {
                        span .dimmed {
                            (pair.wins) "/" (pair.matches)
                        }
                        " "
                        (percentage(pair.wins, pair.matches))
                    } @else { "-" }
                }
                div { strong { "pair" } }
                div {
                    @if let Some(pair) = stats.away.pair {
                        (percentage(pair.wins, pair.matches))
                        " "
                        span .dimmed {
                            (pair.wins) "/" (pair.matches)
                        }
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        span .dimmed {
                            (total.wins) "/" (total.matches)
                        }
                        " "
                        (percentage(total.wins, total.matches))
                    } @else { "-" }
                }
                div { strong { "total" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (percentage(total.wins, total.matches))
                        " "
                        span .dimmed {
                            (total.wins) "/" (total.matches)
                        }
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        (round(total.goals_for as f64 / total.matches as f64))
                    } @else { "-" }
                }
                div { strong { "gf" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (round(total.goals_for as f64 / total.matches as f64))
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        (round(total.goals_against as f64 / total.matches as f64))
                    } @else { "-" }
                }
                div { strong { "ga" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (round(total.goals_against as f64 / total.matches as f64))
                    } @else { "-" }
                }
            }
        }
        (style(r#"
                me {
                    padding-top: 8px;
                    font-size: 13px;

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

                    .dimmed {
                        display: inline-block;
                        color: #999;
                        padding: 0 6px;
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
                }
            "#))
    }
}

fn percentage(numerator: i64, denominator: i64) -> String {
    if denominator == 0 {
        "0 %".to_string()
    } else {
        format!(
            "{} %",
            (numerator as f64 / denominator as f64 * 100.0).round()
        )
    }
}

fn round(n: f64) -> String {
    format!("{:.2}", (n * 100.0).round() / 100.0)
}
