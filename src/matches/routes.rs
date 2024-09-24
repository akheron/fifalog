use crate::db::Database;
use crate::index::Index;
use crate::matches::latest_matches::LatestMatches;
use crate::matches::match_actions::{MatchActions, MatchActionsMode};
use crate::matches::match_stats::match_stats;
use crate::matches::randomize::{
    get_random_match_from_all, get_random_match_from_leagues, RandomMatch,
};
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::{MatchId, UserId};
use axum::extract::{Path, Query};
use axum::{Extension, Form};
use maud::Markup;
use serde::Deserialize;
use serde_with::{serde_as, NoneAsEmptyString};
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
        return LatestMatches::default()
            .with_create_match_pair_error("User 1 and user 2 cannot be the same")
            .render(&dbc)
            .await
            .map(|markup| markup.style_as_comment());
    }

    let random_match_opt = {
        let matches = sql::matches(&dbc, 1, 10).await?;
        let last_teams = matches
            .iter()
            .map(|m| m.home_id)
            .chain(matches.iter().map(|m| m.away_id))
            .collect::<HashSet<_>>();

        let leagues = sql::leagues(&dbc, false).await?;
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
        return LatestMatches::default()
            .with_create_match_pair_error("No teams available to create a match")
            .render(&dbc)
            .await
            .map(|markup| markup.style_as_comment());
    };

    sql::create_match(&dbc, league_id, home_id, away_id, body.user1, body.user2).await?;
    sql::create_match(&dbc, league_id, home_id, away_id, body.user2, body.user1).await?;

    LatestMatches::default()
        .render(&dbc)
        .await
        .map(|markup| markup.style_as_comment())
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

pub async fn match_actions(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
    Query(query): Query<MatchActionsQuery>,
) -> Result<Markup> {
    let mode = match query.mode {
        Some(Mode::Stats) => MatchActionsMode::Stats(match_stats(&dbc, id).await?),
        Some(Mode::Edit) => MatchActionsMode::Edit,
        _ => MatchActionsMode::Blank,
    };
    Ok(MatchActions::new(id, mode).render().style_as_comment())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FinishedType {
    FullTime,
    OverTime,
    Penalties,
}

#[serde_as]
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchResultBody {
    home_score: i32,
    away_score: i32,
    finished_type: FinishedType,
    #[serde_as(as = "NoneAsEmptyString")]
    home_penalty_goals: Option<i32>,
    #[serde_as(as = "NoneAsEmptyString")]
    away_penalty_goals: Option<i32>,
}

pub async fn finish_match(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
    Form(match_result): Form<MatchResultBody>,
) -> Result<Markup> {
    let (finished_type, home_penalty_goals, away_penalty_goals) = match match_result.finished_type {
        FinishedType::FullTime => (sql::FinishedType::FullTime, None, None),
        FinishedType::OverTime => (sql::FinishedType::OverTime, None, None),
        FinishedType::Penalties => (
            sql::FinishedType::Penalties,
            match_result.home_penalty_goals,
            match_result.away_penalty_goals,
        ),
    };
    sql::finish_match(
        &dbc,
        id,
        finished_type,
        match_result.home_score,
        match_result.away_score,
        home_penalty_goals,
        away_penalty_goals,
    )
    .await?;

    Index::default()
        .render(&dbc)
        .await
        .map(|markup| markup.style_as_comment())
}

pub async fn delete_match(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
) -> Result<Markup> {
    let ok = sql::delete_match(&dbc, id).await?;
    if ok {
        LatestMatches::default()
    } else {
        LatestMatches::default().with_create_match_pair_error("This match cannot be deleted")
    }
    .render(&dbc)
    .await
    .map(|markup| markup.style_as_comment())
}
