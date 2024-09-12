use crate::db::Database;
use crate::matches::latest_matches::LatestMatches;
use crate::result::Result;
use crate::stats::Stats;
use maud::{html, Markup};

pub mod routes;

#[derive(Default)]
pub struct Index {
    page: Option<i64>,
}

impl Index {
    pub fn with_page(self, page: i64) -> Self {
        Self { page: Some(page) }
    }

    pub async fn render(&self, dbc: &Database) -> Result<Markup> {
        let stats = Stats::default().render(&dbc).await?;
        let latest_matches = LatestMatches::default()
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
