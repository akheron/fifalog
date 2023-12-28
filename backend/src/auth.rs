use crate::utils::generic_error;
use crate::{Config, GenericResponse};
use async_trait::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::http::StatusCode;
use axum::middleware::FromExtractorLayer;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use cookie::time::Duration;
use cookie::{Cookie, SameSite};
use serde::Deserialize;
use std::convert::Infallible;
use std::time::{SystemTime, UNIX_EPOCH};
use tower_cookies::Cookies;

static COOKIE_NAME: &str = "session";

async fn status(IsLoggedIn(is_logged_in): IsLoggedIn) -> StatusCode {
    if is_logged_in {
        StatusCode::OK
    } else {
        StatusCode::UNAUTHORIZED
    }
}

#[derive(Deserialize)]
struct LoginBody {
    username: String,
    password: String,
}

async fn login(
    Extension(config): Extension<Config>,
    cookies: Cookies,
    Json(body): Json<LoginBody>,
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
        Err(generic_error(
            StatusCode::BAD_REQUEST,
            "Invalid credentials",
        ))
    }
}

async fn logout(Extension(config): Extension<Config>, cookies: Cookies) -> StatusCode {
    let signed = cookies.signed(&config.secret);
    let cookie_opt = signed.get(COOKIE_NAME);
    if let Some(mut cookie) = cookie_opt {
        cookie.set_path("/");
        cookies.signed(&config.secret).remove(cookie);
    }
    StatusCode::NO_CONTENT
}

pub fn auth_routes() -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/logout", get(logout))
        .route("/status", get(status))
}

pub struct IsLoggedIn(pub bool);

#[async_trait]
impl FromRequestParts<()> for IsLoggedIn {
    type Rejection = Infallible;

    async fn from_request_parts(parts: &mut Parts, state: &()) -> Result<Self, Self::Rejection> {
        let Extension(config) = Extension::<Config>::from_request_parts(parts, state)
            .await
            .unwrap();
        let Extension(cookies) = Extension::<Cookies>::from_request_parts(parts, state)
            .await
            .unwrap();
        let cookie = cookies.signed(&config.secret).get(COOKIE_NAME);
        if cookie.is_none() {
            return Ok(Self(false));
        }
        let cookie_value = cookie.unwrap().value().parse::<u64>();
        if cookie_value.is_err() {
            return Ok(Self(false));
        }

        let seconds_since_epoch = cookie_value.unwrap();
        let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();

        if time.as_secs() - seconds_since_epoch > 60 * 60 * 24 * 14 {
            return Ok(Self(false));
        }

        Ok(Self(true))
    }
}

pub struct LoginRequired;

#[async_trait]
impl FromRequestParts<()> for LoginRequired {
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, state: &()) -> Result<Self, Self::Rejection> {
        let IsLoggedIn(is_logged_in) = IsLoggedIn::from_request_parts(parts, state).await.unwrap();
        if is_logged_in {
            Ok(Self)
        } else {
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

pub fn login_required() -> FromExtractorLayer<LoginRequired, ()> {
    axum::middleware::from_extractor::<LoginRequired>()
}
