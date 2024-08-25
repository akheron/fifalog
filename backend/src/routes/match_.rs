use crate::api_types::League;
use crate::components::MatchActionsMode;
use crate::db::Database;
use crate::randomize::{get_random_match_from_all, get_random_match_from_leagues, RandomMatch};
use crate::result::Result;
use crate::sql::sql_types::{MatchId, UserId};
use crate::{components, domain, sql};
use axum::extract::{Path, Query};
use axum::{Extension, Form};
use maud::Markup;
use serde::Deserialize;
use std::collections::HashSet;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RandomMatchPairBody {
    user1: UserId,
    user2: UserId,
    respect_leagues: bool,
}

pub async fn create_random_match_pair(
    Extension(dbc): Extension<Database>,
    Form(body): Form<RandomMatchPairBody>,
) -> Result<Markup> {
    if body.user1 == body.user2 {
        return components::LatestMatches::default()
            .with_create_match_pair_error("User 1 and user 2 cannot be the same")
            .render(&dbc)
            .await;
    }

    let random_match_opt = {
        let matches = sql::matches(&dbc, 1, 10).await?;
        let last_teams = matches
            .iter()
            .map(|m| m.home_id)
            .chain(matches.iter().map(|m| m.away_id))
            .collect::<HashSet<_>>();

        let leagues = sql::leagues(&dbc, false)
            .await?
            .into_iter()
            .map(League::from)
            .collect::<Vec<_>>();

        if body.respect_leagues {
            get_random_match_from_leagues(&leagues, &last_teams)
        } else {
            get_random_match_from_all(&leagues, &last_teams)
        }
    };

    let Some(RandomMatch {
        league_id,
        home_id,
        away_id,
    }) = random_match_opt
    else {
        return components::LatestMatches::default()
            .with_create_match_pair_error("No teams available to create a match")
            .render(&dbc)
            .await;
    };

    sql::create_match(&dbc, league_id, home_id, away_id, body.user1, body.user2).await?;
    sql::create_match(&dbc, league_id, home_id, away_id, body.user2, body.user1).await?;

    components::LatestMatches::default().render(&dbc).await
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Stats,
    Edit,
}

#[derive(Deserialize)]
pub struct MatchActionsQuery {
    pub mode: Option<Mode>,
}

pub async fn match_actions_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
    Query(query): Query<MatchActionsQuery>,
) -> Result<Markup> {
    let mode = match query.mode {
        Some(Mode::Stats) => MatchActionsMode::Stats(domain::match_stats(&dbc, id).await?),
        _ => MatchActionsMode::Blank,
    };
    Ok(components::match_actions(id, mode))
}

pub async fn delete_match_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
) -> Result<Markup> {
    let ok = sql::delete_match(&dbc, id).await?;
    if ok {
        components::LatestMatches::default()
    } else {
        components::LatestMatches::default()
            .with_create_match_pair_error("This match cannot be deleted")
    }
    .render(&dbc)
    .await
}
