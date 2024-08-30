use std::cmp::min;
use std::collections::HashSet;

use axum::extract::Path;
use axum::http::StatusCode;
use axum::routing::{delete, get, patch, post, put};
use axum::{Extension, Json, Router};
use eyre::Result;
use serde::{Deserialize, Serialize};

use crate::api_types::{Stats, UserStats};
use crate::db::is_integrity_error;
use crate::sql::finished_match_count;
use crate::sql::sql_types::{LeagueId, MatchId, TeamId, UserId};
use crate::utils::{generic_error, GenericResponse};
use crate::{
    get_random_match_from_all, get_random_match_from_leagues, sql, Database, League, Match,
    RandomMatch, User,
};

async fn leagues(
    Extension(dbc): Extension<Database>,
) -> Result<Json<Vec<League>>, GenericResponse> {
    let rows = sql::leagues(&dbc, true).await?;
    Ok(Json(rows.into_iter().map(League::from).collect()))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LeagueBody {
    name: String,
    exclude_random_all: bool,
}

async fn update_league(
    Extension(dbc): Extension<Database>,
    Path(id): Path<LeagueId>,
    Json(body): Json<LeagueBody>,
) -> Result<StatusCode, GenericResponse> {
    let result = sql::update_league(&dbc, id, body.name, body.exclude_random_all).await?;
    if result {
        Ok(StatusCode::OK)
    } else {
        Err(generic_error(StatusCode::NOT_FOUND, "No such league"))
    }
}

pub struct MatchesResult {
    pub data: Vec<Match>,
    pub last10: i64,
    pub total: i64,
}

pub async fn matches(
    dbc: &Database,
    page: Option<i64>,
    page_size: Option<i64>,
) -> Result<MatchesResult> {
    let finished_count = finished_match_count(dbc).await?;
    let last10 = finished_count - 9;

    let rows = sql::matches(&dbc, page.unwrap_or(1), page_size.unwrap_or(20)).await?;
    let data = rows.into_iter().map(Match::from).collect();

    let total = sql::match_count(&dbc).await?;

    Ok(MatchesResult {
        data,
        last10,
        total,
    })
}

async fn delete_match(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
) -> Result<StatusCode, GenericResponse> {
    let result = sql::delete_match(&dbc, id).await?;
    if result {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(generic_error(
            StatusCode::BAD_REQUEST,
            "This match cannot be deleted",
        ))
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TeamTotalStats {
    wins: i64,
    losses: i64,
    matches: i64,
    goals_for: i64,
    goals_against: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TeamPairStats {
    wins: i64,
    losses: i64,
    matches: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MatchTeamStats {
    team_id: TeamId,
    total: Option<TeamTotalStats>,
    pair: Option<TeamPairStats>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MatchStats {
    home: MatchTeamStats,
    away: MatchTeamStats,
}

async fn match_team_stats(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
) -> Result<Json<MatchStats>, GenericResponse> {
    let stats = sql::match_team_stats(&dbc, id).await?;
    Ok(Json(MatchStats {
        home: MatchTeamStats {
            team_id: stats.home_id,
            total: stats.total_wins_home.map(|wins| TeamTotalStats {
                wins,
                losses: stats.total_losses_home.unwrap(),
                matches: stats.total_matches_home.unwrap(),
                goals_for: stats.total_goals_for_home.unwrap(),
                goals_against: stats.total_goals_against_home.unwrap(),
            }),
            pair: stats.pair_wins_home.map(|wins| TeamPairStats {
                wins,
                losses: stats.pair_losses_home.unwrap(),
                matches: stats.pair_matches.unwrap(),
            }),
        },
        away: MatchTeamStats {
            team_id: stats.away_id,
            total: stats.total_wins_away.map(|wins| TeamTotalStats {
                wins,
                losses: stats.total_losses_away.unwrap(),
                matches: stats.total_matches_away.unwrap(),
                goals_for: stats.total_goals_for_away.unwrap(),
                goals_against: stats.total_goals_against_away.unwrap(),
            }),
            pair: stats.pair_wins_away.map(|wins| TeamPairStats {
                wins,
                losses: stats.pair_losses_away.unwrap(),
                matches: stats.pair_matches.unwrap(),
            }),
        },
    }))
}

// #[derive(Deserialize)]
// #[serde(rename_all = "camelCase")]
// struct MatchResultBody {
//     home_score: i32,
//     away_score: i32,
//     finished_type: FinishedType,
// }
//
// async fn finish_match(
//     Extension(dbc): Extension<Database>,
//     Path(id): Path<MatchId>,
//     Json(match_result): Json<MatchResultBody>,
// ) -> Result<Json<Match>, GenericResponse> {
//     let (finished_type, home_penalty_goals, away_penalty_goals) = match match_result.finished_type {
//         FinishedType::FullTime => (sql::FinishedType::FullTime, None, None),
//         FinishedType::OverTime => (sql::FinishedType::OverTime, None, None),
//         FinishedType::Penalties {
//             home_goals,
//             away_goals,
//         } => (
//             sql::FinishedType::Penalties,
//             Some(home_goals),
//             Some(away_goals),
//         ),
//     };
//     let result = sql::finish_match(
//         &dbc,
//         id,
//         finished_type,
//         Some(match_result.home_score),
//         Some(match_result.away_score),
//         home_penalty_goals,
//         away_penalty_goals,
//     )
//     .await?;
//
//     if result {
//         Ok(Json(sql::match_(&dbc, id).await?.map(Match::from).unwrap()))
//     } else {
//         Err(generic_error(StatusCode::NOT_FOUND, "No such match"))
//     }
// }

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RandomMatchPairBody {
    user1: UserId,
    user2: UserId,
    respect_leagues: bool,
}

async fn create_random_match_pair(
    Extension(dbc): Extension<Database>,
    Json(body): Json<RandomMatchPairBody>,
) -> Result<Json<(Match, Match)>, GenericResponse> {
    if body.user1 == body.user2 {
        return Err(generic_error(
            StatusCode::BAD_REQUEST,
            "User 1 and user 2 cannot be the same",
        ));
    }

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

    let match1_id =
        sql::create_match(&dbc, league_id, home_id, away_id, body.user1, body.user2).await?;
    let match2_id =
        sql::create_match(&dbc, league_id, home_id, away_id, body.user2, body.user1).await?;

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

async fn users(Extension(dbc): Extension<Database>) -> Result<Json<Vec<User>>, GenericResponse> {
    let rows = sql::users(&dbc).await?;
    Ok(Json(rows.into_iter().map(User::from).collect()))
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateTeamBody {
    league_id: LeagueId,
    name: String,
    disabled: bool,
}

async fn create_team(
    Extension(dbc): Extension<Database>,
    Json(body): Json<CreateTeamBody>,
) -> Result<StatusCode, GenericResponse> {
    let result = sql::create_team(&dbc, body.league_id, body.name, body.disabled).await?;
    if result {
        Ok(StatusCode::OK)
    } else {
        Err(generic_error(
            StatusCode::BAD_REQUEST,
            "Could not create team",
        ))
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateTeamBody {
    league_id: Option<LeagueId>,
    name: Option<String>,
    disabled: Option<bool>,
}

async fn patch_team(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
    Json(body): Json<UpdateTeamBody>,
) -> Result<StatusCode, GenericResponse> {
    let result = sql::update_team(&dbc, id, body.league_id, body.name, body.disabled).await?;
    if result {
        Ok(StatusCode::OK)
    } else {
        Err(generic_error(StatusCode::NOT_FOUND, "No such team"))
    }
}

async fn delete_team(
    Extension(dbc): Extension<Database>,
    Path(id): Path<TeamId>,
) -> Result<StatusCode, GenericResponse> {
    sql::delete_team(&dbc, id)
        .await
        .map(|success| {
            if success {
                StatusCode::OK
            } else {
                StatusCode::NOT_FOUND
            }
        })
        .map_err(|error| {
            if is_integrity_error(&error) {
                generic_error(
                    StatusCode::BAD_REQUEST,
                    "Cannot delete team because it has existing matches",
                )
            } else {
                error.into()
            }
        })
}

pub async fn stats(dbc: &Database, limit: usize) -> Result<(Vec<Stats>, usize)> {
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

pub fn api_routes() -> Router {
    Router::new()
        .route("/leagues", get(leagues))
        .route("/leagues/:id", put(update_league))
        // .route("/matches", get(matches))
        // .route("/matches/random_pair", post(create_random_match_pair))
        .route("/matches/:id", delete(delete_match))
        .route("/matches/:id/team-stats", get(match_team_stats))
        // .route("/matches/:id/finish", post(finish_match))
        .route("/teams", post(create_team))
        .route("/teams/:id", patch(patch_team))
        .route("/teams/:id", delete(delete_team))
        // .route("/stats", get(stats))
        .route("/users", get(users))
}
