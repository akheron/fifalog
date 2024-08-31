use crate::api_types::League;
use crate::components::page;
use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::style::Style;
use axum::Extension;
use maud::{html, Markup};

pub async fn teams_route(Extension(dbc): Extension<Database>) -> Result<Markup> {
    let leagues = sql::leagues(&dbc, true)
        .await?
        .into_iter()
        .map(League::from)
        .collect::<Vec<_>>();

    let style = Style::new(
        r#"
        table th {
            text-align: left;
        }

        .name {
            width: 160px;
        }

        .matches {
            width: 30px;
        }

        .disabled {
            color: #ccc;
        }
    "#,
    );

    Ok(page(html! {
        div class=(style.class()) {
            h2 { "Teams" }
            @for league in leagues {
                h3 {
                    (league.name)
                    span .hgap-s {}
                    button { "E" }
                }
                p { "Excluded from randomize: " (if league.exclude_random_all { "Yes" } else { "No" }) }
                table {
                    thead {
                        tr {
                            th .name { "Name" }
                            th .matches { "M" }
                        }
                    }
                    tbody {
                        @for team in league.teams {
                            tr class=(if team.disabled { "disabled" } else { "" }) {
                                td { (team.name) }
                                td { (team.match_count) }
                                td {
                                    button { "E" }
                                    span .hgap-s {}
                                    @if team.match_count == 0 {
                                        button { "R" }
                                    } else {
                                        button { "D" }
                                    }
                                    span .hgap-s {}
                                    button { "⭢" }
                                }
                            }
                        }
                    }
                }
            }
            div .vgap-m {}
            div {
                div { "M = Matches" }
                div { "E = Edit" }
                div { "R = Remove" }
                div { "D = Disable/Enable" }
                div { "⭢ = Move to another league" }
            }
        }
        (style.as_comment())
    }))
}
