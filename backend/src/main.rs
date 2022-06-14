use std::net::SocketAddr;

use axum::response::Html;
use axum::routing::get;
use axum_extra::routing::SpaRouter;
use axum::{middleware, Extension, Router};
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;

use crate::api_routes::api_routes;
use crate::api_types::{FinishedType, League, Match, User};
use crate::auth::{auth_middleware, auth_routes};
use crate::config::Config;
use crate::db::{database_layer, Database};
use crate::env::Env;
use crate::randomize::{get_random_match_from_all, get_random_match_from_leagues, RandomMatch};
use crate::utils::{response, GenericResponse};

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
    let db = database_layer(&env.database_url, env.database_pool_size.unwrap_or(10))?;

    let app = Router::new()
        .nest("/auth", auth_routes())
        .nest(
            "/api",
            api_routes().layer(middleware::from_fn(auth_middleware)),
        )
        .route("/", get(index))
        .merge(SpaRouter::new("/assets", &env.asset_path))
        .layer(
            ServiceBuilder::new()
                .layer(Extension(config))
                .layer(db)
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

async fn index() -> Html<String> {
    Html(format!(r#"<!DOCTYPE html>

<head>
  <title>FIFA log</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" type="text/css" href="/assets/index.css">
</head>

<body>
  <div id="app"></div>
  <script>var IS_LOGGED_IN = {is_logged_in};</script>
  <script src="/assets/index.js"></script>
</body>
"#, is_logged_in = false))
}
