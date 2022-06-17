use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub struct GenericResponse(StatusCode, String);

impl GenericResponse {
    fn new(status: StatusCode, message: String) -> Self {
        Self(status, message)
    }
}

impl IntoResponse for GenericResponse {
    fn into_response(self) -> Response {
        (self.0, self.1).into_response()
    }
}

impl From<tokio_postgres::Error> for GenericResponse {
    fn from(error: tokio_postgres::Error) -> Self {
        internal_error(error)
    }
}

pub fn response<T: Into<String>>(status: StatusCode, body: T) -> GenericResponse {
    GenericResponse::new(status, body.into())
}

pub fn internal_error<E: std::error::Error>(err: E) -> GenericResponse {
    let err_string = err.to_string();
    println!("ERROR: {}", err_string);
    GenericResponse::new(StatusCode::INTERNAL_SERVER_ERROR, err_string)
}
