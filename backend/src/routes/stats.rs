use crate::api_routes::stats;
use crate::api_types::Stats;
use crate::db::Database;
use crate::result::Result;
use askama::Template;
use axum::extract::Query;
use axum::Extension;
use serde::Deserialize;
use std::cmp::max;

#[derive(Template)]
#[template(path = "components/stats.html")]
pub struct StatsTemplate {
    stats: Vec<Stats>,
    more: i32,
    expanded: bool,
}

impl StatsTemplate {
    pub async fn new(dbc: &Database, expanded: bool) -> Result<Self> {
        let limit = if expanded { usize::MAX } else { 5 };
        let (stats, total_count) = stats(dbc, limit).await?;
        Ok(Self {
            stats,
            more: max(0, total_count as i32 - 5),
            expanded,
        })
    }
}

#[derive(Deserialize)]
pub struct StatsQuery {
    pub expanded: Option<bool>,
}

pub async fn stats_route(
    Extension(dbc): Extension<Database>,
    Query(query): Query<StatsQuery>,
) -> Result<StatsTemplate> {
    StatsTemplate::new(&dbc, query.expanded.unwrap_or(false)).await
}
