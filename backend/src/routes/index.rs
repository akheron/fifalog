use crate::components;
use crate::components::page;
use crate::db::Database;
use crate::result::Result;
use crate::style::Style;
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
        let style = Style::new(r#"max-width: 375px; margin: 0 auto;"#);
        let stats = components::stats(&dbc, false).await?;
        let latest_matches = components::LatestMatches::default()
            .with_pagination(self.page.unwrap_or(1), 20)
            .render(&dbc)
            .await?;

        Ok(html! {
            div class=(style.class()) {
                (menu())
                div #stats {
                    (stats)
                }
                div #latest-matches {
                    (latest_matches)
                }
            }
            (style.as_comment())
        })
    }
}

fn menu() -> Markup {
    let style = Style::new(
        r#"
            font-size: 13px;
            display: flex;

            a {
                flex: 0 0 auto;
                color: #0000ee;
                &:visited {
                    color: #0000ee;
                }
            }
            .logout {
                flex: 0 0 auto;
            }
        "#,
    );
    html! {
        div class=(style.class()) {
            a href="/" { "Home" }
            div .hgap-m {}
            a href="/teams" { "Teams" }
            div .filler {}
            button .text .logout { "Sign out" }
        }
        (style.as_comment())
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
