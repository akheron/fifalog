use axum::routing::{delete, get, post};
use axum::Router;

mod index;
mod match_;
mod stats;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(index::index_route))
        .route("/match/randomize", post(match_::create_random_match_pair))
        .route("/match/:id", delete(match_::delete_match_route))
        .route("/match/:id/actions", get(match_::match_actions_route))
        .route("/stats", get(stats::stats_route))
}
