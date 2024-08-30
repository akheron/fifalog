mod api_routes;
mod api_types;
mod auth;
mod components;
mod config;
mod db;
mod domain;
mod env;
mod randomize;
mod result;
mod routes;
mod sql;
mod style;
mod utils;

use std::net::SocketAddr;

use axum::{Extension, Router};
use eyre::{Context, Result};
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;
use tower_http::services::ServeDir;

use crate::api_routes::api_routes;
use crate::api_types::{League, Match, User};
use crate::auth::{auth_routes, login_required};
use crate::config::Config;
use crate::db::Database;
use crate::env::Env;
use crate::randomize::{get_random_match_from_all, get_random_match_from_leagues, RandomMatch};

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
        .nest("/auth", auth_routes())
        .nest("/api", api_routes().route_layer(login_required()))
        .nest("/", routes::routes().route_layer(login_required()))
        .nest_service("/assets", ServeDir::new(&env.asset_path))
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
