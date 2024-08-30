use crate::api_routes;
use crate::db::Database;
use crate::result::Result;
use crate::style::Style;
use maud::{html, Markup};
use std::cmp::max;

pub async fn stats(dbc: &Database, expanded: bool) -> Result<Markup> {
    let limit = if expanded { usize::MAX } else { 5 };
    let (stats, total_count) = api_routes::stats(dbc, limit).await?;
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
                                td { (user.user.name) }
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
