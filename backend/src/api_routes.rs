use std::collections::HashSet;

use axum::extract::Path;
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};
use serde::Deserialize;

use crate::api_types::{Stats, UserStats};
use crate::sql::sql_types::{MatchId, UserId};
use crate::utils::{generic_error, GenericResponse};
use crate::{
    get_random_match_from_all, get_random_match_from_leagues, sql, Database, FinishedType, League,
    Match, RandomMatch, User,
};

async fn leagues(Database(dbc): Database) -> Result<Json<Vec<League>>, GenericResponse> {
    let rows = sql::leagues(&dbc).await?;
    Ok(Json(rows.into_iter().map(League::from).collect()))
}

async fn matches(Database(dbc): Database) -> Result<Json<Vec<Match>>, GenericResponse> {
    let rows = sql::latest_matches(&dbc, 20).await?;
    Ok(Json(rows.into_iter().map(Match::from).collect()))
}

async fn delete_match(
    Database(dbc): Database,
    Path(id): Path<MatchId>,
) -> Result<StatusCode, GenericResponse> {
    let result = sql::delete_match(&dbc, id).await?;
    if result == 1 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(generic_error(
            StatusCode::BAD_REQUEST,
            "This match cannot be deleted",
        ))
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchResultBody {
    pub home_score: i32,
    pub away_score: i32,
    pub finished_type: FinishedType,
}

async fn finish_match(
    Database(dbc): Database,
    Path(id): Path<MatchId>,
    Json(match_result): Json<MatchResultBody>,
) -> Result<Json<Match>, GenericResponse> {
    let (finished_type, home_penalty_goals, away_penalty_goals) = match match_result.finished_type {
        FinishedType::FullTime => (sql::FinishedType::FullTime, None, None),
        FinishedType::OverTime => (sql::FinishedType::OverTime, None, None),
        FinishedType::Penalties {
            home_goals,
            away_goals,
        } => (
            sql::FinishedType::Penalties,
            Some(home_goals),
            Some(away_goals),
        ),
    };
    let result = sql::finish_match(
        &dbc,
        id,
        finished_type,
        Some(match_result.home_score),
        Some(match_result.away_score),
        home_penalty_goals,
        away_penalty_goals,
    )
    .await?;

    if result == 1 {
        Ok(Json(sql::match_(&dbc, id).await?.map(Match::from).unwrap()))
    } else {
        Err(generic_error(StatusCode::NOT_FOUND, "No such match"))
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RandomMatchPairBody {
    user1: UserId,
    user2: UserId,
    respect_leagues: bool,
}

async fn create_random_match_pair(
    Database(dbc): Database,
    Json(body): Json<RandomMatchPairBody>,
) -> Result<Json<(Match, Match)>, GenericResponse> {
    if body.user1 == body.user2 {
        return Err(generic_error(
            StatusCode::BAD_REQUEST,
            "User 1 and user 2 cannot be the same",
        ));
    }

    let matches = sql::latest_matches(&dbc, 10).await?;
    let last_teams = matches
        .iter()
        .map(|m| m.home_id())
        .chain(matches.iter().map(|m| m.away_id()))
        .collect::<HashSet<_>>();

    let leagues = sql::leagues(&dbc)
        .await?
        .into_iter()
        .map(League::from)
        .collect::<Vec<_>>();

    let random_match_opt = if body.respect_leagues {
        get_random_match_from_leagues(&leagues, &last_teams)
    } else {
        get_random_match_from_all(&leagues, &last_teams)
    };

    let RandomMatch {
        league_id,
        home_id,
        away_id,
    } = random_match_opt.ok_or_else(|| {
        generic_error(
            StatusCode::BAD_REQUEST,
            "No teams available to create a match",
        )
    })?;

    let match1_id = sql::create_match(&dbc, league_id, home_id, away_id, body.user1, body.user2)
        .await?
        .id();
    let match2_id = sql::create_match(&dbc, league_id, home_id, away_id, body.user2, body.user1)
        .await?
        .id();

    let match1 = sql::match_(&dbc, match1_id)
        .await?
        .map(Match::from)
        .unwrap();
    let match2 = sql::match_(&dbc, match2_id)
        .await?
        .map(Match::from)
        .unwrap();

    Ok(Json((match1, match2)))
}

async fn users(Database(dbc): Database) -> Result<Json<Vec<User>>, GenericResponse> {
    let rows = sql::users(&dbc).await?;
    Ok(Json(rows.into_iter().map(User::from).collect()))
}

fn group_user_stats_by_month(rows: Vec<sql::user_stats::Row>) -> Vec<Vec<UserStats>> {
    let mut user_stats_by_month: Vec<Vec<UserStats>> = Vec::new();
    let mut curr: Option<String> = None;
    for row in rows {
        let month = row.month();
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

async fn stats(Database(dbc): Database) -> Result<Json<Vec<Stats>>, GenericResponse> {
    let last_user_stats = sql::user_stats(&dbc, 10).await?;
    let last_total_stats = sql::total_stats(&dbc, 10).await?;
    let user_stats = group_user_stats_by_month(sql::user_stats(&dbc, 0).await?);
    let total_stats = sql::total_stats(&dbc, 0).await?;

    let mut response: Vec<Stats> = Vec::new();

    if !last_total_stats.is_empty() {
        let last = last_total_stats.last().unwrap();
        response.push(Stats {
            month: last.month(),
            ties: last.tie_count(),
            matches: last.match_count(),
            goals: last.goal_count(),
            user_stats: last_user_stats.into_iter().map(UserStats::from).collect(),
        });
    }

    total_stats
        .into_iter()
        .zip(user_stats.into_iter())
        .for_each(|(total, user_stats)| {
            response.push(Stats {
                month: total.month(),
                ties: total.tie_count(),
                matches: total.match_count(),
                goals: total.goal_count(),
                user_stats,
            });
        });

    Ok(Json(response))
}

pub fn api_routes() -> Router {
    Router::new()
        .route("/leagues", get(leagues))
        .route("/matches", get(matches))
        .route("/matches/random_pair", post(create_random_match_pair))
        .route("/matches/:id", delete(delete_match))
        .route("/matches/:id/finish", post(finish_match))
        .route("/users", get(users))
        .route("/stats", get(stats))
}
