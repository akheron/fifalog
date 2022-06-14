use crate::{response, Config, GenericResponse};
use axum::http::{Request, StatusCode};
use axum::middleware::Next;
use axum::response::Response;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use cookie::time::Duration;
use cookie::{Cookie, SameSite};
use serde::Deserialize;
use std::time::{SystemTime, UNIX_EPOCH};
use tower_cookies::Cookies;

static COOKIE_NAME: &str = "session";

#[derive(Deserialize)]
pub struct LoginBody {
    username: String,
    password: String,
}

pub async fn login(
    Extension(config): Extension<Config>,
    Json(body): Json<LoginBody>,
    cookies: Cookies,
) -> Result<StatusCode, GenericResponse> {
    if body.username == config.username && body.password == config.password {
        let since_epoch = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        let mut cookie = Cookie::new(COOKIE_NAME, format!("{}", since_epoch.as_secs()));
        cookie.set_path("/");
        cookie.set_same_site(SameSite::Lax);
        cookie.set_http_only(true);
        if config.env == "prod" {
            cookie.set_secure(true);
        }
        cookie.set_max_age(Some(Duration::days(14)));
        cookies.signed(&config.secret).add(cookie);
        Ok(StatusCode::OK)
    } else {
        Err(response(StatusCode::UNAUTHORIZED, "Unauthorized"))
    }
}

pub async fn logout(Extension(config): Extension<Config>, cookies: Cookies) -> StatusCode {
    let signed = cookies.signed(&config.secret);
    let cookie_opt = signed.get(COOKIE_NAME);
    if let Some(cookie) = cookie_opt {
        cookies.signed(&config.secret).remove(cookie);
    }
    StatusCode::NO_CONTENT
}

pub fn auth_routes() -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/logout", get(logout))
}

pub async fn auth_middleware<B>(req: Request<B>, next: Next<B>) -> Result<Response, StatusCode> {
    let config = req.extensions().get::<Config>().unwrap();
    let cookies = req.extensions().get::<Cookies>().unwrap();
    let cookie = cookies.signed(&config.secret).get(COOKIE_NAME).ok_or(StatusCode::UNAUTHORIZED)?;
    let seconds_since_epoch = cookie
        .value()
        .parse::<u64>()
        .map_err(|_| StatusCode::UNAUTHORIZED)?;
    if let Ok(time) = SystemTime::now().duration_since(UNIX_EPOCH) {
        if time.as_secs() - seconds_since_epoch > 60 * 60 * 24 * 14 {
            return Err(StatusCode::UNAUTHORIZED);
        }
    }
    Ok(next.run(req).await)
}
