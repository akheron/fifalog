use crate::components;
use crate::db::Database;
use crate::result::Result;
use crate::style::Style;
use axum::extract::Query;
use axum::response::IntoResponse;
use axum::Extension;
use maud::{html, Markup};
use serde::Deserialize;

fn index(stats: Markup, latest_matches: Markup) -> Markup {
    let style = Style::new(r#"max-width: 375px; margin: 0 auto;"#);
    html! {
        div class=(style.class()) {
            (menu())
            (stats)
            (latest_matches)
        }
        (style.as_comment())
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
) -> Result<impl IntoResponse> {
    Ok(components::page(index(
        components::stats(&dbc, false).await?,
        components::LatestMatches::default()
            .with_pagination(query.page.unwrap_or(1), 20)
            .render(&dbc)
            .await?,
    )))
}
