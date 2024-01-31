use axum::routing::{delete, get};
use axum::Router;

mod create_match_pair;
mod index;
mod match_;
mod match_list;
mod stats;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(index::index_route))
        .route("/match/:id", delete(match_::delete_match_route))
        .route("/stats", get(stats::stats_route))
}
