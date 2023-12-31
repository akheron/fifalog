use crate::components;
use crate::db::Database;
use crate::result::Result;
use axum::extract::Query;
use axum::Extension;
use maud::Markup;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct StatsQuery {
    pub expanded: Option<bool>,
}

pub async fn stats_route(
    Extension(dbc): Extension<Database>,
    Query(query): Query<StatsQuery>,
) -> Result<Markup> {
    components::stats(&dbc, query.expanded.unwrap_or(false)).await
}
