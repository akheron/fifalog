use crate::db::Database;
use crate::matches::latest_matches::LatestMatches;
use crate::result::Result;
use crate::stats::Stats;
use crate::style::{StyledMarkup, Unstyled};
use maud::html;

pub mod routes;

#[derive(Default)]
pub struct Index {
    page: Option<i64>,
}

impl Index {
    pub fn with_page(self, page: i64) -> Self {
        Self { page: Some(page) }
    }

    pub async fn render(&self, dbc: &Database) -> Result<StyledMarkup> {
        let stats = Stats::default().render(&dbc).await?;
        let latest_matches = LatestMatches::default()
            .with_pagination(self.page.unwrap_or(1), 20)
            .render(&dbc)
            .await?;

        Ok(Unstyled.into_markup(|s| {
            html! {
                div #index {
                    div #stats {
                        (stats.eject_style(s))
                    }
                    div #latest-matches {
                        (latest_matches.eject_style(s))
                    }
                }
            }
        }))
    }
}
