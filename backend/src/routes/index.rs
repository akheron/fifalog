use crate::components;
use crate::components::page;
use crate::db::Database;
use crate::result::Result;
use axum::extract::Query;
use axum::Extension;
use maud::{html, Markup};
use serde::Deserialize;

#[derive(Default)]
pub struct Index {
    page: Option<i64>,
}

impl Index {
    pub fn with_page(self, page: i64) -> Self {
        Self { page: Some(page) }
    }

    pub async fn render(&self, dbc: &Database) -> Result<Markup> {
        let stats = components::stats(&dbc, false).await?;
        let latest_matches = components::LatestMatches::default()
            .with_pagination(self.page.unwrap_or(1), 20)
            .render(&dbc)
            .await?;

        Ok(html! {
            div #stats {
                (stats)
            }
            div #latest-matches {
                (latest_matches)
            }
        })
    }
}

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
