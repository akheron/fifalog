use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::MatchId;
use crate::style::Style;
use maud::{html, Markup};

pub fn match_team_stats(stats: &MatchStats) -> Markup {
    let style = Style::new(
        r#"
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
        "#,
    );
    html! {
        div class=(style.class()) {
            div .row {
                div {
                    @if let Some(pair) = &stats.home.pair {
                        span .dimmed {
                            (pair.wins) "/" (pair.matches)
                        }
                        " "
                        (percentage(pair.wins, pair.matches))
                    } @else { "-" }
                }
                div { strong { "pair" } }
                div {
                    @if let Some(pair) = &stats.away.pair {
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
        (style.as_comment())
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

pub struct TeamTotalStats {
    pub wins: i64,
    pub matches: i64,
    pub goals_for: i64,
    pub goals_against: i64,
}

pub struct TeamPairStats {
    pub wins: i64,
    pub matches: i64,
}

pub struct MatchTeamStats {
    pub total: Option<TeamTotalStats>,
    pub pair: Option<TeamPairStats>,
}

pub struct MatchStats {
    pub home: MatchTeamStats,
    pub away: MatchTeamStats,
}

pub async fn match_stats(dbc: &Database, id: MatchId) -> Result<MatchStats> {
    let stats = sql::match_team_stats(&dbc, id).await?;
    Ok(MatchStats {
        home: MatchTeamStats {
            total: stats.total_wins_home.map(|wins| TeamTotalStats {
                wins,
                matches: stats.total_matches_home.unwrap(),
                goals_for: stats.total_goals_for_home.unwrap(),
                goals_against: stats.total_goals_against_home.unwrap(),
            }),
            pair: stats.pair_wins_home.map(|wins| TeamPairStats {
                wins,
                matches: stats.pair_matches.unwrap(),
            }),
        },
        away: MatchTeamStats {
            total: stats.total_wins_away.map(|wins| TeamTotalStats {
                wins,
                matches: stats.total_matches_away.unwrap(),
                goals_for: stats.total_goals_for_away.unwrap(),
                goals_against: stats.total_goals_against_away.unwrap(),
            }),
            pair: stats.pair_wins_away.map(|wins| TeamPairStats {
                wins,
                matches: stats.pair_matches.unwrap(),
            }),
        },
    })
}
