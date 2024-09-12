use crate::db::{is_integrity_error, Database};
use crate::page::page;
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::{LeagueId, TeamId};
use crate::style::Style;
use axum::extract::Path;
use axum::response::{IntoResponse, Response};
use axum::Extension;
use axum_extra::extract::Form;
use maud::{html, Markup};
use serde::Deserialize;

async fn teams_page(dbc: &Database) -> Result<Markup> {
    let leagues = sql::leagues(&dbc, true).await?;

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

            .error {
                color: #f00;
            }
        "#,
    );

    Ok(page(html! {
        div class=(style.class()) hx-target="body" {
            h2 { "Teams" }
            @for league in &leagues {
                form x-data="{ editing: false }" hx-put=(format!("/league/{}", league.id)) {
                    h3 x-show="!editing" {
                        (league.name)
                        span .hgap-s {}
                        button type="button" x-on:click="editing = true" { "E" }
                    }
                    h3 x-show="editing" {
                        input type="text" name="name" value=(league.name);
                        span .hgap-s {}
                        button type="submit" { "save" }
                        span .hgap-s {}
                        button type="button" x-on:click="editing = false" { "cancel" }
                    }
                    p {
                        "Excluded from randomize: "
                        span x-show="!editing" {
                            (if league.exclude_random_all { "Yes" } else { "No" })
                        }
                        template x-if="editing" {
                            input type="checkbox" name="exclude_random_all" value="true" checked[league.exclude_random_all];
                        }
                    }
                    template x-if="editing" {
                        div .error {}
                    }
                }
                table {
                    thead {
                        tr {
                            th .name { "Name" }
                            th .matches { "M" }
                        }
                    }
                    tbody {
                        @for team in &league.teams {
                            tr class=(if team.disabled { "disabled" } else { "" })
                                    x-data="{ mode: null }" {
                                td {
                                    span x-show="mode !== 'edit'" { (team.name) }
                                    template x-if="mode === 'edit'" {
                                        input type="text" name="name" value=(team.name);
                                    }
                                }
                                td { (team.match_count) }
                                td x-show="mode === null" {
                                    button x-on:click="mode = 'edit'" { "E" }
                                    span .hgap-s {}
                                    @if team.match_count == 0 {
                                        button hx-delete=(format!("/team/{}", team.id))
                                                hx-confirm="Are you sure?" {
                                            "x"
                                        }
                                    } @else {
                                        button hx-post=(format!("/team/{}/{}", team.id, if team.disabled { "enable" } else { "disable" })) { "D" }
                                    }
                                    span .hgap-s {}
                                    button x-on:click="mode = 'move'" { "⭢" }
                                }
                                td x-show="mode === 'edit'" {
                                    div {
                                        button hx-put=(format!("/team/{}", team.id)) hx-include="closest tr" { "save" }
                                        span .hgap-s {}
                                        button x-on:click="mode = null" { "cancel" }
                                    }
                                    template x-if="mode === 'edit'" {
                                        div .error {}
                                    }
                                }
                                td x-show="mode === 'move'" {
                                    select name="league_id" {
                                        @for other_league in leagues.iter().filter(|l| l.id != league.id) {
                                            option value=(other_league.id) { (other_league.name) }
                                        }
                                    }
                                    div .vgap-s {}
                                    div {
                                        button hx-post=(format!("/team/{}/move", team.id)) hx-include="closest td" { "save" }
                                        span .hgap-s {}
                                        button x-on:click="mode = null" { "cancel" }
                                    }
                                }
                            }
                        }
                        tr x-data="{ creating: false }" {
                            td {
                                button x-show="!creating" x-on:click="creating = true" { "+" }
                                input type="hidden" name="league_id" value=(league.id);
                                template x-if="creating" {
                                    input type="text" name="name" required;
                                }
                            }
                            td {}
                            td x-show="creating" {
                                div {
                                    button type="submit" hx-post="/team" hx-include="closest tr" { "create" }
                                    span .hgap-s {}
                                    button type="button" x-on:click="creating = false" { "cancel" }
                                }
                                div .error {}
                            }
                        }
                    }
                }
            }
            div .vgap-m {}
            div {
                div { "M = Matches" }
                div { "E = Edit" }
                div { "D = Disable/Enable" }
                div { "x = Delete" }
                div { "⭢ = Move to another league" }
            }
        }
        (style.as_comment())
    }))
}

pub async fn teams_route(Extension(dbc): Extension<Database>) -> Result<Markup> {
    teams_page(&dbc).await
}

#[derive(Deserialize)]
pub struct LeagueBody {
    name: String,
    exclude_random_all: Option<bool>,
}

pub async fn update_league_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<LeagueId>,
    Form(body): Form<LeagueBody>,
) -> Result<Response> {
    let ok = sql::update_league(
        &dbc,
        id,
        body.name,
        body.exclude_random_all.unwrap_or(false),
    )
    .await
    .or_else(|error| {
        if is_integrity_error(&error) {
            Ok(false)
        } else {
            Err(error)
        }
    })?;
    Ok(if ok {
        teams_page(&dbc).await?.into_response()
    } else {
        (
            [("HX-Retarget", "find .error")],
            [("HX-Reswap", "textContent")],
            "Failed to update league",
        )
            .into_response()
    })
}

#[derive(Deserialize)]
pub struct CreateTeamBody {
    league_id: LeagueId,
    name: String,
}

pub async fn create_team_route(
    Extension(dbc): Extension<Database>,
    Form(body): Form<CreateTeamBody>,
) -> Result<Response> {
    let created = sql::create_team(&dbc, body.league_id, body.name, false)
        .await
        .or_else(|error| {
            if is_integrity_error(&error) {
                Ok(false)
            } else {
                Err(error)
            }
        })?;
    if created {
        Ok(teams_page(&dbc).await?.into_response())
    } else {
        Ok((
            [("HX-Retarget", "next .error"), ("HX-Reswap", "textContent")],
            "Failed to create team",
        )
            .into_response())
    }
}

#[derive(Deserialize)]
pub struct UpdateTeamBody {
    name: String,
}

pub async fn update_team_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
    Form(body): Form<UpdateTeamBody>,
) -> Result<Response> {
    let ok = sql::update_team(&dbc, id, None, Some(body.name), None)
        .await
        .or_else(|error| {
            if is_integrity_error(&error) {
                Ok(false)
            } else {
                Err(error)
            }
        })?;
    Ok(if ok {
        teams_page(&dbc).await?.into_response()
    } else {
        (
            [("HX-Retarget", "next .error")],
            [("HX-Reswap", "textContent")],
            "Failed to update team",
        )
            .into_response()
    })
}

pub async fn enable_team_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
) -> Result<Markup> {
    sql::update_team(&dbc, id, None, None, Some(false)).await?;
    teams_page(&dbc).await
}

pub async fn disable_team_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
) -> Result<Markup> {
    sql::update_team(&dbc, id, None, None, Some(true)).await?;
    teams_page(&dbc).await
}

#[derive(Deserialize)]
pub struct MoveTeamBody {
    league_id: LeagueId,
}

pub async fn move_team_route(
    Extension(dbc): Extension<Database>,
    Path(team_id): Path<TeamId>,
    Form(body): Form<MoveTeamBody>,
) -> Result<Markup> {
    sql::update_team(&dbc, team_id, Some(body.league_id), None, None).await?;
    teams_page(&dbc).await
}

pub async fn delete_team_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
) -> Result<Markup> {
    sql::delete_team(&dbc, id).await?;
    teams_page(&dbc).await
}
