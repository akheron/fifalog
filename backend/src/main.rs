use std::net::SocketAddr;

use axum::Router;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;
use tower_http::services::{ServeDir, ServeFile};

use crate::api_routes::api_routes;
use crate::api_types::{FinishedType, League, Match, User};
use crate::auth::{auth_routes, login_required};
use crate::config::Config;
use crate::db::{database_layer, database_pool, Database};
use crate::env::Env;
use crate::randomize::{get_random_match_from_all, get_random_match_from_leagues, RandomMatch};
use crate::utils::GenericResponse;

mod api_routes;
mod api_types;
mod auth;
mod config;
mod db;
mod env;
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

    let app = Router::new()
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

    let addr: SocketAddr = env.bind.unwrap_or_else(|| "0.0.0.0:8080".parse().unwrap());
    let listener = TcpListener::bind(&addr).await?;

    println!("Starting server on {}", &addr);
    axum::serve(listener, app.into_make_service())
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
