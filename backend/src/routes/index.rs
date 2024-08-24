use crate::components;
use crate::db::Database;
use crate::result::Result;
use crate::utils::style;
use axum::extract::Query;
use axum::response::IntoResponse;
use axum::Extension;
use maud::{html, Markup};
use serde::Deserialize;

fn index(stats: Markup, latest_matches: Markup) -> Markup {
    html! {
        div {
            (menu())
            (stats)
            (latest_matches)
            (style(r#"
                me {
                    max-width: 375px;
                    margin: 0 auto;
                }
            "#))
        }
    }
}

fn menu() -> Markup {
    html! {
        div {
            a href="/" { "Home" }
            div .hgap-m {}
            a href="/teams" { "Teams" }
            div .filler {}
            button .text .logout { "Logout" }
            (style(r#"
                me {
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
                }
            "#)) 
        }
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
