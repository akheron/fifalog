use crate::db::Database;
use crate::result::Result;
use crate::stats::Stats;
use axum::extract::Query;
use axum::Extension;
use maud::Markup;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct StatsQuery {
    pub expanded: Option<bool>,
}

pub async fn stats(
    Extension(dbc): Extension<Database>,
    Query(query): Query<StatsQuery>,
) -> Result<Markup> {
    Stats::default()
        .with_expanded(query.expanded.unwrap_or(false))
        .render(&dbc)
        .await
}
