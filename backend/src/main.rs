use std::net::SocketAddr;

use axum::Router;
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;
use tower_http::services::{ServeDir, ServeFile};

use crate::api_routes::api_routes;
use crate::api_types::{FinishedType, League, Match, User};
use crate::auth::{auth_routes, login_required};
use crate::config::Config;
use crate::db::{database_layer, database_pool, Database};
use crate::env::Env;
use crate::otel::otel_layer;
use crate::randomize::{get_random_match_from_all, get_random_match_from_leagues, RandomMatch};
use crate::utils::GenericResponse;

mod api_routes;
mod api_types;
mod auth;
mod config;
mod db;
mod env;
mod otel;
mod randomize;
mod sql;
mod utils;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let env = Env::read()?;
    let config = Config::from_env(&env);

    println!("Running migrations...");
    let dbc_pool = database_pool(&env.database_url, env.database_pool_size.unwrap_or(10))?;
    migrations::run(dbc_pool.clone()).await?;

    let mut app = Router::new()
        .nest("/auth", auth_routes())
        .nest(
            "/api",
            api_routes()
                .with_state(())
                .route_layer(login_required(config.clone())),
        )
        .nest_service("/assets", ServeDir::new(&env.asset_path))
        .nest_service("/", ServeFile::new(env.asset_path + "/index.html"))
        .layer(
            ServiceBuilder::new()
                .layer(database_layer(dbc_pool))
                .layer(CookieManagerLayer::new()),
        )
        .with_state(config);

    if let Some(api_key) = env.honeycomb_api_key {
        app = app.layer(otel_layer(&api_key, &env.env)?);
    }

    let bind: SocketAddr = env.bind.unwrap_or_else(|| "0.0.0.0:8080".parse().unwrap());
    println!("Starting server on {}", &bind);
    axum::Server::bind(&bind)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

mod migrations {
    use deadpool_postgres::Pool;
    use refinery::embed_migrations;

    embed_migrations!();

    pub async fn run(pool: Pool) -> Result<(), Box<dyn std::error::Error>> {
        let mut dbc = pool.get().await?;
        self::migrations::runner()
            .run_async(&mut dbc as &mut tokio_postgres::Client)
            .await?;
        Ok(())
    }
}
