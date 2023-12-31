use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::MatchId;
use axum::extract::Path;
use axum::http::StatusCode;
use axum::Extension;

pub async fn delete_match_route(
    Extension(dbc): Extension<Database>,
    Path(id): Path<MatchId>,
) -> Result<(StatusCode, &'static str)> {
    let result = sql::delete_match(&dbc, id).await?;
    Ok(if result {
        (StatusCode::OK, "")
    } else {
        (StatusCode::BAD_REQUEST, "This match cannot be deleted")
    })
}
