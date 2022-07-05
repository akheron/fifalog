use std::net::SocketAddr;

use axum::{Extension, Router};
use axum_extra::routing::SpaRouter;
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;

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
        .nest("/api", api_routes().layer(login_required()))
        .merge(SpaRouter::new("/assets", &env.asset_path))
        .layer(
            ServiceBuilder::new()
                .layer(Extension(config))
                .layer(database_layer(dbc_pool))
                .layer(CookieManagerLayer::new()),
        );

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
