use axum::routing::{delete, get, post};
use axum::Router;

pub mod latest_matches;
pub mod match_actions;
pub mod match_stats;
pub mod randomize;
pub mod routes;

pub fn routes() -> Router {
    Router::new()
        .route("/randomize", post(routes::create_random_match_pair))
        .route("/:id/finish", post(routes::finish_match))
        .route("/:id", delete(routes::delete_match))
        .route("/:id/actions", get(routes::match_actions))
}
