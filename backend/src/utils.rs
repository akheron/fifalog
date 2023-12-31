use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use maud::{html, Markup, PreEscaped};
use serde::Serialize;

pub struct GenericResponse(StatusCode, String);

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

impl IntoResponse for GenericResponse {
    fn into_response(self) -> Response {
        (self.0, Json(ErrorBody { error: self.1 })).into_response()
    }
}

impl From<sqlx::Error> for GenericResponse {
    fn from(error: sqlx::Error) -> Self {
        internal_error(error)
    }
}

pub fn generic_error<T: Into<String>>(status: StatusCode, error: T) -> GenericResponse {
    GenericResponse(status, error.into())
}

pub fn internal_error<E: std::error::Error>(err: E) -> GenericResponse {
    let err_string = err.to_string();
    println!("ERROR: {}", err_string);
    generic_error(StatusCode::INTERNAL_SERVER_ERROR, err_string)
}

pub fn style(s: &str) -> Markup {
    html! {
        style { (PreEscaped(s)) }
    }
}
