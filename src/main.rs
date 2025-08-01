mod auth;
mod config;
mod db;
mod env;
mod index;
mod matches;
mod page;
mod result;
mod sql;
mod stats;
mod style;
mod teams;
mod utils;

use std::net::SocketAddr;

use crate::auth::{auth_routes, login_required};
use crate::config::Config;
use crate::env::Env;
use axum::routing::{delete, get, post, put};
use axum::{Extension, Router};
use eyre::{Context, Result};
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;

#[tokio::main]
async fn main() -> Result<()> {
    let env = Env::read()?;
    let config = Config::from_env(&env);

    println!("Running migrations...");
    let dbc_pool = PgPoolOptions::new()
        .max_connections(env.database_pool_size.unwrap_or(5))
        .connect(&env.database_url)
        .await
        .wrap_err("Connecting to database failed")?;
    sqlx::migrate!()
        .run(&dbc_pool)
        .await
        .wrap_err("Running migrations failed")?;

    let app = Router::new()
        .route("/", get(index::routes::index_route))
        .route("/teams", get(teams::teams_route))
        .route("/league/:id", put(teams::update_league_route))
        .route("/team", post(teams::create_team_route))
        .route("/team/:id", put(teams::update_team_route))
        .route("/team/:id/enable", post(teams::enable_team_route))
        .route("/team/:id/disable", post(teams::disable_team_route))
        .route("/team/:id/move", post(teams::move_team_route))
        .route("/team/:id", delete(teams::delete_team_route))
        .nest("/match", matches::routes())
        .nest("/stats", stats::routes())
        .route_layer(login_required())
        .nest("/auth", auth_routes())
        .layer(
            ServiceBuilder::new()
                .layer(Extension(config))
                .layer(Extension(dbc_pool))
                .layer(CookieManagerLayer::new()),
        );

    let addr: SocketAddr = env
        .bind
        .unwrap_or_else(|| "127.0.0.1:8080".parse().unwrap());
    let listener = TcpListener::bind(&addr).await?;

    println!("Starting server on {}", &addr);
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();

    Ok(())
}
