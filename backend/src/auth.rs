use crate::components::page;
use crate::style::Style;
use crate::Config;
use async_trait::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::http::{header, StatusCode};
use axum::middleware::FromExtractorLayer;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Extension, Form, Router};
use cookie::time::Duration;
use cookie::{Cookie, SameSite};
use maud::{html, Markup};
use serde::Deserialize;
use std::convert::Infallible;
use std::time::{SystemTime, UNIX_EPOCH};
use tower_cookies::Cookies;

static COOKIE_NAME: &str = "session";

#[derive(Default)]
struct LoginForm {
    username: Option<String>,
    failed: bool,
}

impl LoginForm {
    pub fn failed(username: String) -> Self {
        Self {
            username: Some(username),
            failed: true,
        }
    }

    pub fn render(self) -> Markup {
        let style = Style::new(
            r#"
            .row {
              margin-top: 0.5em;
            }

            .actions {
              margin-top: 1em;
            }

            .name {
              display: inline-block;
              min-width: 5em;
            }

            .error {
              color: #f00;
            }
        "#,
        );
        page(html! {
            h2 { "Login" }
            form class=(style.class()) method="POST" {
                div class="row" {
                    label {
                        span class="name" { "Username:" }
                        span class="hgap-s" {}
                        input type="text" name="username" value=[self.username] required;
                    }
                }
                div class="row" {
                    label {
                        span class="name" { "Password:" }
                        span class="hgap-s" {}
                        input type="password" name="password" required;
                    }
                }
                div class="actions" {
                    button { "Login" }
                    span class="hgap-s" {}
                    @if self.failed {
                        span class="error" { "Login failed" }
                    }
                }
            }
            (style.as_comment())
        })
    }
}

pub async fn login_page_route() -> Markup {
    LoginForm::default().render()
}

#[derive(Deserialize)]
pub struct LoginBody {
    username: String,
    password: String,
}

pub async fn login_route(
    Extension(config): Extension<Config>,
    cookies: Cookies,
    Form(body): Form<LoginBody>,
) -> Response {
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
        (StatusCode::SEE_OTHER, [(header::LOCATION, "/")]).into_response()
    } else {
        LoginForm::failed(body.username).render().into_response()
    }
}

async fn logout_route(Extension(config): Extension<Config>, cookies: Cookies) -> Response {
    let signed = cookies.signed(&config.secret);
    let cookie_opt = signed.get(COOKIE_NAME);
    if let Some(mut cookie) = cookie_opt {
        cookie.set_path("/");
        cookies.signed(&config.secret).remove(cookie);
    }
    (StatusCode::SEE_OTHER, [(header::LOCATION, "/auth/login")]).into_response()
}

pub fn auth_routes() -> Router {
    Router::new()
        .route("/login", get(login_page_route))
        .route("/login", post(login_route))
        .route("/logout", get(logout_route))
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
        let Some(cookie) = cookies.signed(&config.secret).get(COOKIE_NAME) else {
            return Ok(Self(false));
        };

        let cookie_value = cookie.value().parse::<u64>();
        let Ok(seconds_since_epoch) = cookie_value else {
            return Ok(Self(false));
        };
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
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &()) -> Result<Self, Self::Rejection> {
        let IsLoggedIn(is_logged_in) = IsLoggedIn::from_request_parts(parts, state).await.unwrap();
        if is_logged_in {
            Ok(Self)
        } else {
            Err((StatusCode::SEE_OTHER, [(header::LOCATION, "/auth/login")]).into_response())
        }
    }
}

pub fn login_required() -> FromExtractorLayer<LoginRequired, ()> {
    axum::middleware::from_extractor::<LoginRequired>()
}
