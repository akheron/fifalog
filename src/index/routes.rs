use crate::db::Database;
use crate::index::Index;
use crate::page::page;
use crate::result::Result;
use axum::extract::Query;
use axum::Extension;
use maud::Markup;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct IndexQuery {
    pub page: Option<i64>,
}

pub async fn index_route(
    Extension(dbc): Extension<Database>,
    Query(query): Query<IndexQuery>,
) -> Result<Markup> {
    let index = Index::default()
        .with_page(query.page.unwrap_or(1))
        .render(&dbc)
        .await?;
    Ok(page(index))
}
