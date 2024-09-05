use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::style::Style;
use maud::{html, Markup};
use std::cmp::{max, min};

pub async fn stats(dbc: &Database, expanded: bool) -> Result<Markup> {
    let limit = if expanded { usize::MAX } else { 5 };
    let (stats, total_count) = compute_stats(dbc, limit).await?;
    let more = max(0, total_count as i32 - 5);

    let style = Style::new(
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
    );

    Ok(html! {
        h2 { "Stats" }
        div class=(style.class()) {
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
                @for row in stats {
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
                    hx-vals=(if expanded { r#"{ "expanded": false }"# } else { r#"{ "expanded": true }"# })
                    hx-swap=[if expanded { Some("show:top") } else { None }] {
                        "show " (more) " " (if expanded { "less" } else { "more" })
                }
            }
        }
        (style.as_comment())
    })
}

async fn compute_stats(dbc: &Database, limit: usize) -> Result<(Vec<Stats>, usize)> {
    let last_user_stats = sql::user_stats(dbc, 10).await?;
    let last_total_stats = sql::total_stats(dbc, 10).await?;
    let user_stats = group_user_stats_by_month(sql::user_stats(dbc, 0).await?);
    let total_stats = sql::total_stats(dbc, 0).await?;

    let total_count = total_stats.len() + if last_total_stats.is_empty() { 0 } else { 1 };
    let mut result: Vec<Stats> = Vec::with_capacity(min(total_count, limit));

    if !last_total_stats.is_empty() {
        let last = last_total_stats.last().unwrap();
        result.push(Stats {
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
            result.push(Stats {
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

struct Stats {
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
