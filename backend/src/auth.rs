use crate::{response, Config, GenericResponse};
use async_trait::async_trait;
use axum::extract::{FromRequest, RequestParts};
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
}

pub struct IsLoggedIn(pub bool);

#[async_trait]
impl<B> FromRequest<B> for IsLoggedIn
where
    B: Send,
{
    type Rejection = Infallible;

    async fn from_request(req: &mut RequestParts<B>) -> Result<Self, Self::Rejection> {
        let Extension(config) = Extension::<Config>::from_request(req).await.unwrap();
        let Extension(cookies) = Extension::<Cookies>::from_request(req).await.unwrap();
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
impl<B> FromRequest<B> for LoginRequired
where
    B: Send,
{
    type Rejection = StatusCode;

    async fn from_request(req: &mut RequestParts<B>) -> Result<Self, Self::Rejection> {
        let IsLoggedIn(is_logged_in) = IsLoggedIn::from_request(req).await.unwrap();
        if is_logged_in {
            Ok(Self)
        } else {
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

pub fn login_required() -> FromExtractorLayer<LoginRequired> {
    axum::middleware::from_extractor::<LoginRequired>()
}
