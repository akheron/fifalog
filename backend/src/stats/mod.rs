use crate::db::Database;
use crate::style::{Style, StyledMarkup};
use crate::{result, sql};
use axum::routing::get;
use axum::Router;
use maud::html;
use std::cmp::{max, min};

pub mod routes;

pub fn routes() -> Router {
    Router::new().route("/", get(routes::stats))
}

#[derive(Default)]
pub struct Stats {
    expanded: bool,
}

impl Stats {
    pub fn with_expanded(self, expanded: bool) -> Self {
        Self { expanded }
    }

    pub async fn render(&self, dbc: &Database) -> result::Result<StyledMarkup> {
        let limit = if self.expanded { usize::MAX } else { 5 };
        let (stats_rows, total_count) = compute_stats(dbc, limit).await?;
        let more = max(0, total_count as i32 - 5);

        Ok(Style::new(
            r#"
            table {
                font-size: 13px;
                width: 100%;
                border-spacing: 0;
                border-collapse: collapse;

                thead th {
                    text-align: left;
                }

                tbody:not(:last-child) {
                    border-bottom: 1px solid #999;
                }

                tr:first-child td {
                    padding-top: 8px;
                }

                tr:last-child td {
                    padding-bottom: 8px;
                }

                td:first-child {
                    font-weight: bold;
                    width: 1px;
                    white-space: nowrap;
                    padding-right: 10px;
                    border-right: 1px solid #999;
                }

                td:nth-child(2) {
                    padding-left: 10px;
                }

                td {
                    padding-bottom: 3px;
                }
            }
        "#,
        ).into_markup(|class, _s| {
            html! {
                h2 { "Stats" }
                div class=(class) {
                    table {
                        thead {
                            tr {
                                th {}
                                th {}
                                th { "W" }
                                th {}
                                th { "G" }
                            }
                        }
                        @for row in stats_rows {
                            tbody {
                                @for (i, user) in row.user_stats.iter().enumerate() {
                                    tr {
                                        td { @if i == 0 { (row.month) } }
                                        td { (user.name) }
                                        td { (user.wins) }
                                        td { "(" (user.over_time_wins) " OT)" }
                                        td { (user.goals_for) }
                                    }
                                }
                                tr {
                                    td {}
                                    td { "Total" }
                                    td { (row.matches) }
                                    td { "(" (row.ties) " tied)" }
                                    td { (row.goals) }
                                }
                            }
                        }
                    }
                    div .vgap-s {}
                    @if more > 0 {
                        button
                            hx-get="/stats"
                            hx-target="#stats"
                            hx-disabled-elt="this"
                            hx-vals=(if self.expanded { r#"{ "expanded": false }"# } else { r#"{ "expanded": true }"# })
                            hx-swap=[if self.expanded { Some("show:top") } else { None }] {
                                "show " (more) " " (if self.expanded { "less" } else { "more" })
                        }
                    }
                }
            }
        }))
    }
}

async fn compute_stats(dbc: &Database, limit: usize) -> result::Result<(Vec<StatsRow>, usize)> {
    let last_user_stats = sql::user_stats(dbc, 10).await?;
    let last_total_stats = sql::total_stats(dbc, 10).await?;
    let user_stats = group_user_stats_by_month(sql::user_stats(dbc, 0).await?);
    let total_stats = sql::total_stats(dbc, 0).await?;

    let total_count = total_stats.len() + if last_total_stats.is_empty() { 0 } else { 1 };
    let mut result: Vec<StatsRow> = Vec::with_capacity(min(total_count, limit));

    if !last_total_stats.is_empty() {
        let last = last_total_stats.last().unwrap();
        result.push(StatsRow {
            month: last.month.clone(),
            ties: last.tie_count,
            matches: last.match_count,
            goals: last.goal_count,
            user_stats: last_user_stats.into_iter().map(UserStats::from).collect(),
        });
    }

    total_stats
        .into_iter()
        .zip(user_stats.into_iter())
        .take(limit)
        .for_each(|(total, user_stats)| {
            result.push(StatsRow {
                month: total.month,
                ties: total.tie_count,
                matches: total.match_count,
                goals: total.goal_count,
                user_stats,
            });
        });

    Ok((result, total_count))
}

fn group_user_stats_by_month(rows: Vec<sql::user_stats::Row>) -> Vec<Vec<UserStats>> {
    let mut user_stats_by_month: Vec<Vec<UserStats>> = Vec::new();
    let mut curr: Option<String> = None;
    for row in rows {
        let month = row.month.clone();
        let user_stats = UserStats::from(row);
        if user_stats_by_month.is_empty() || &month != curr.as_ref().unwrap() {
            user_stats_by_month.push(vec![user_stats]);
            curr = Some(month);
        } else {
            user_stats_by_month.last_mut().unwrap().push(user_stats);
        }
    }
    user_stats_by_month
}

struct StatsRow {
    month: String,
    user_stats: Vec<UserStats>,
    ties: i32,
    matches: i32,
    goals: i32,
}

struct UserStats {
    name: String,
    wins: i32,
    over_time_wins: i32,
    goals_for: i32,
}

impl From<sql::user_stats::Row> for UserStats {
    fn from(row: sql::user_stats::Row) -> Self {
        Self {
            name: row.user_name,
            wins: row.win_count,
            over_time_wins: row.overtime_win_count,
            goals_for: row.goals_for,
        }
    }
}
