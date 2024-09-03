use axum::routing::{delete, get, post, put};
use axum::Router;

mod index;
mod match_;
mod stats;
mod teams;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(index::index_route))
        .route("/teams", get(teams::teams_route))
        .route("/league/:id", put(teams::update_league_route))
        .route("/match/randomize", post(match_::create_random_match_pair))
        .route("/match/:id/finish", post(match_::finish_match_route))
        .route("/match/:id", delete(match_::delete_match_route))
        .route("/match/:id/actions", get(match_::match_actions_route))
        .route("/stats", get(stats::stats_route))
        .route("/team", post(teams::create_team_route))
        .route("/team/:id", put(teams::update_team_route))
        .route("/team/:id/enable", post(teams::enable_team_route))
        .route("/team/:id/disable", post(teams::disable_team_route))
        .route("/team/:id/move", post(teams::move_team_route))
        .route("/team/:id", delete(teams::delete_team_route))
}
